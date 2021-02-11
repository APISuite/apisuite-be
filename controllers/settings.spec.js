const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../test/helpers')
const { models, sequelize } = require('../models')
const msgBroker = require('../services/msg-broker')
const Setting = models.Setting
const {
  get,
  upsert,
} = require('./settings')

describe('Settings', () => {
  describe('get', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        findOne: sinon.stub(Setting, 'findOne'),
        create: sinon.stub(Setting, 'create'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return 200 and the settings', async () => {
      const mockData = {
        values: {
          portalName: 'test',
        },
      }
      const req = mockRequest()
      const res = mockResponse()
      stubs.findOne.resolves(mockData)

      await get(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, { portalName: 'test' })
    })

    it('should return 200 and the settings when no settings exist yet', async () => {
      const req = mockRequest()
      const res = mockResponse()
      stubs.findOne.resolves(null)
      stubs.create.resolves({ values: {} })

      await get(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, {})
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest()
      const res = mockResponse({ sendInternalError: sinon.spy(() => undefined) })
      stubs.findOne.rejects()

      await get(req, res)
      sinon.assert.called(res.sendInternalError)
    })
  })

  describe('upsert', () => {
    let stubs = {}
    const fakeTxn = {
      commit: sinon.spy(async () => undefined),
      rollback: sinon.spy(async () => undefined),
      _reset: function () {
        this.commit.resetHistory()
        this.rollback.resetHistory()
      },
    }

    beforeEach(() => {
      stubs = {
        findOne: sinon.stub(Setting, 'findOne'),
        create: sinon.stub(Setting, 'create'),
        update: sinon.stub(Setting, 'update'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
        publishEvent: sinon.stub(msgBroker, 'publishEvent').resolves(),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      body: {
        portalName: 'ACME',
        clientName: 'ACMEclient',
      },
    }

    const mockData = {
      values: {
        portalName: 'test',
        clientName: 'someclient',
      },
    }

    it('should return 200 and the updated settings', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves(mockData)
      stubs.update.resolves([1, [mockData]])

      await upsert(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledOnce(fakeTxn.commit)
    })

    it('should return 200 and the updated settings when no settings exist', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.onFirstCall().resolves(null)
      stubs.create.resolves({ values: {} })
      stubs.update.resolves([1, [mockData]])
      stubs.findOne.onSecondCall().resolves(mockData)

      await upsert(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledOnce(fakeTxn.commit)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.rejects()

      await upsert(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('getIdp', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        findOne: sinon.stub(Setting, 'findOne'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return 200 and the settings', async () => {
      const req = mockRequest()
      const res = mockResponse()
      stubs.findOne.resolves({ values: {} })

      await get(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, {})
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest()
      const res = mockResponse({ sendInternalError: sinon.spy(() => undefined) })
      stubs.findOne.rejects()

      await get(req, res)
      sinon.assert.called(res.sendInternalError)
    })
  })

  describe('updateIdp', () => {
    let stubs = {}
    const fakeTxn = {
      commit: sinon.spy(async () => undefined),
      rollback: sinon.spy(async () => undefined),
      _reset: function () {
        this.commit.resetHistory()
        this.rollback.resetHistory()
      },
    }

    beforeEach(() => {
      stubs = {
        findOne: sinon.stub(Setting, 'findOne'),
        create: sinon.stub(Setting, 'create'),
        update: sinon.stub(Setting, 'update'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
        publishEvent: sinon.stub(msgBroker, 'publishEvent').resolves(),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      body: {
        provider: 'Internal',
        configuration: {},
      },
    }

    const mockData = {
      values: {
        provider: 'Internal',
        configuration: {},
      },
    }

    it('should return 200 and the updated settings', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves(mockData)
      stubs.update.resolves([1, [mockData]])

      await upsert(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledOnce(fakeTxn.commit)
    })

    it('should return 200 and the updated settings when no settings exist', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.onFirstCall().resolves(null)
      stubs.create.resolves({ values: {} })
      stubs.update.resolves([1, [mockData]])
      stubs.findOne.onSecondCall().resolves(mockData)

      await upsert(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledOnce(fakeTxn.commit)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.rejects()

      await upsert(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })
})
