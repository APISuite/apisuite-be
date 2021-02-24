const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../util/test-helpers')
const { models, sequelize } = require('../models')
const Api = models.Api
const App = models.App
const Gateway = require('../util/gateway')
const {
  subscribeToAPI,
  isSubscribedTo,
} = require('./app')

describe('Apps', () => {
  describe('subscribeToAPI', async () => {
    let stubs = {}
    const fakeTxn = helpers.getFakeTxn()
    const gateway = await Gateway()

    beforeEach(() => {
      stubs = {
        app_findOne: sinon.stub(App, 'findOne'),
        api_count: sinon.stub(Api, 'count'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
        gw_unsubscribeAPIs: sinon.stub(gateway, 'unsubscribeAPIs'),
        gw_subscribeAPIs: sinon.stub(gateway, 'subscribeAPIs'),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      params: { id: 1 },
      body: {
        subscriptions: [99, 88],
      },
      user: { org: { id: 100 } },
    }

    it('should return 404 if the app is not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.app_findOne.resolves()

      await subscribeToAPI(req, res)
      sinon.assert.called(fakeTxn.commit)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 404 if not all APIs are found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.app_findOne.resolves({})
      stubs.api_count.resolves(mockReq.body.subscriptions.length - 1)

      await subscribeToAPI(req, res)
      sinon.assert.called(fakeTxn.commit)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.app_findOne.rejects()

      await subscribeToAPI(req, res)
      sinon.assert.called(fakeTxn.rollback)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })

    it('should return 200 and the updated app', async () => {
      const mockUpdApp = { id: 1, name: 'acme' }
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.app_findOne.onFirstCall().resolves({
        getSubscriptions: sinon.stub().resolves([{ id: 88 }, { id: 99 }]),
        removeSubscriptions: sinon.stub().resolves(),
        addSubscriptions: sinon.stub().resolves(),
      })
      stubs.app_findOne.onSecondCall().resolves(mockUpdApp)
      stubs.api_count.resolves(mockReq.body.subscriptions.length)
      stubs.gw_unsubscribeAPIs.resolves({})
      stubs.gw_subscribeAPIs.resolves({})

      await subscribeToAPI(req, res)
      sinon.assert.called(fakeTxn.commit)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, mockUpdApp)
    })
  })

  describe('isSubscribedTo', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        app_findOne: sinon.stub(App, 'findOne'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      body: {
        path: '/somepath?param=666',
      },
    }

    it('should return 400 when app data was not injected', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await isSubscribedTo(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })

    it('should return 404 when the app does not exist', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: {
          loggedInApp: {
            clientId: 'someclientid',
          },
        },
      })
      stubs.app_findOne.resolves()

      await isSubscribedTo(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 200 and the success payload', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: {
          loggedInApp: {
            clientId: 'someclientid',
          },
        },
      })
      const mockApp = {
        subscriptions: [{}],
        organization: { org_code: 'somecode' },
      }
      stubs.app_findOne.resolves(mockApp)

      await isSubscribedTo(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.json, sinon.match.has('org_code', mockApp.organization.org_code))
    })

    it('should return 500 when an unexpected error occurs', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: {
          loggedInApp: {
            clientId: 'someclientid',
          },
        },
      })
      stubs.app_findOne.rejects()

      await isSubscribedTo(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })
})
