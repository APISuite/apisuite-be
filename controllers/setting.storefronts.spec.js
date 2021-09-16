const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../util/test-helpers')
const { models } = require('../models')
const SettingsStoreFronts = models.SettingsStoreFronts

const {
  get,
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
})
