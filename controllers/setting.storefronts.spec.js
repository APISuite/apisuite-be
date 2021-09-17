const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../util/test-helpers')
const { models } = require('../models')
const SettingsStoreFronts = models.SettingsStoreFronts

const {
  get,
  put,
} = require('./settings.strorefronts')

describe('Settings StoreFronts', () => {
  describe('get', () => {
    let stubs = {}
    beforeEach(() => {
      stubs = {
        findOne: sinon.stub(SettingsStoreFronts, 'findOne'),
      }
    })
    afterEach(() => {
      sinon.restore()
    })
    it('should return 200 and the settings', async () => {
      const mockReq = {
        params: {
          name: 'batatas',
        },
      }
      const mockData = {
        values: {
          provider: 'internal',
          configuration: {
            clientsURL: 'http://apisuite-hydra-server:4445/clients',
          },
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves(mockData)
      await get(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, mockData.values)
    })
    it('should return 404 when the api does not exist', async () => {
      const mockReq = 'batata'
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves()
      await get(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })
  })
  describe('put', () => {
    let stubs = {}
    beforeEach(() => {
      stubs = {
        create: sinon.stub(SettingsStoreFronts, 'create'),
      }
    })
    afterEach(() => {
      sinon.restore()
    })
    const mockReqUpdate = {
      params: {
        name: 'batatas',
      },
      body: {
        provider: 'internal',
        configuration: { clientsURL: 'http://apisuite-hydra-server:4445/clients6' },
      },
    }
    const mockReqInsert = {
      params: {
        name: 'batatas1',
      },
      body: {
        provider: 'internal',
        configuration: { clientsURL: 'http://apisuite-hydra-server:4445/clients6' },
      },
    }
    it('should return 200 Update', async () => {
      const req = mockRequest(mockReqUpdate)
      const res = mockResponse()
      stubs.create.resolves(mockReqUpdate)
      await put(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 200 Insert', async () => {
      const req = mockRequest(mockReqInsert)
      const res = mockResponse()
      stubs.create.resolves(mockReqInsert)
      await put(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })
  })
})
