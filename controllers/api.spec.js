const path = require('path')
const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../util/test-helpers')
const { models, sequelize } = require('../models')
const Api = models.Api
const ApiVersion = models.ApiVersion
const swaggerUtil = require('../util/swagger_util')
const Gateway = require('../services/gateway')
const Storage = require('../services/storage')
const {
  getAll,
  getById,
  createAPI,
  updateAPI,
  deleteAPI,
  createAPIversion,
  updateAPIversion,
  setPublished,
} = require('./api')

describe('APIs', () => {
  describe('getAll', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        findAllPaginated: sinon.stub(Api, 'findAllPaginated'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return 200 and the apis', async () => {
      const mockReq = { query: { page: 1, pageSize: 10 } }
      const mockData = {
        rows: [],
        pagination: {
          rowCount: 0,
          pageCount: 0,
          page: mockReq.query.page,
          pageSize: mockReq.query.pageSize,
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findAllPaginated.resolves(mockData)

      await getAll(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, mockData)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest()
      const res = mockResponse({ sendInternalError: sinon.spy(() => undefined) })
      stubs.findAllPaginated.rejects()

      await getAll(req, res)
      sinon.assert.called(res.sendInternalError)
    })
  })

  describe('getById', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        findOne: sinon.stub(Api, 'findOne'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = { params: { id: 1 } }

    it('should return 200 and the api', async () => {
      const mockData = { id: 1 }
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves(mockData)

      await getById(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, mockData)
    })

    it('should return 404 when the api does not exist', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves()

      await getById(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.rejects()

      await getById(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('createAPI', () => {
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
        findOne: sinon.stub(Api, 'findOne'),
        create: sinon.stub(Api, 'create'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      body: {
        name: 'ACME API',
        baseUri: 'someurl',
        baseUriSandbox: 'someotherurl',
      },
    }

    it('should return 400 if an API with the same name exists', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves({ id: 999 })

      await createAPI(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })

    it('should return 201 and return the new entity', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      const mockData = { id: 1, ...mockReq.body }
      stubs.findOne.resolves()
      stubs.create.resolves(mockData)

      await createAPI(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CREATED)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findOne.resolves()
      stubs.create.rejects()

      await createAPI(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
      sinon.assert.notCalled(fakeTxn.commit)
      sinon.assert.calledOnce(fakeTxn.rollback)
    })
  })

  describe('updateAPI', () => {
    let stubs = {}
    const fakeTxn = helpers.getFakeTxn()

    beforeEach(() => {
      stubs = {
        api_update: sinon.stub(Api, 'update'),
        apiVersion_update: sinon.stub(ApiVersion, 'update').resolves(),
        apiVersion_destroy: sinon.stub(ApiVersion, 'destroy').resolves(),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      params: { id: 1 },
      body: {
        name: 'ACME API',
      },
    }

    it('should return 404 if an API is not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.api_update.resolves([0, []])

      await updateAPI(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
      sinon.assert.notCalled(fakeTxn.commit)
      sinon.assert.calledOnce(fakeTxn.rollback)
    })

    it('should return 204 and the updated entity', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.api_update.resolves([1])

      await updateAPI(req, res)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })
  })

  describe('deleteAPI', async () => {
    let stubs = {}
    const fakeTxn = helpers.getFakeTxn()
    const gateway = await Gateway()

    beforeEach(() => {
      stubs = {
        destroy: sinon.stub(Api, 'destroy'),
        findByPk: sinon.stub(Api, 'findByPk'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
        gw_unsubscribeAPIs: sinon.stub(gateway, 'unsubscribeAPIs'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = { params: { id: 1 } }
    const mockAPI = {
      getSubscriptions: sinon.stub().resolves([{ id: 88 }, { id: 99 }]),
      removeSubscriptions: sinon.stub().resolves(),
    }

    it('should return 204 and the api', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findByPk.resolves(mockAPI)
      stubs.gw_unsubscribeAPIs.resolves()
      stubs.destroy.resolves()

      await deleteAPI(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NO_CONTENT)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 404 when the api does not exist', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.findByPk.resolves(null)

      await deleteAPI(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
      sinon.assert.notCalled(fakeTxn.commit)
      sinon.assert.calledOnce(fakeTxn.rollback)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.destroy.rejects()

      await deleteAPI(req, res)
      helpers.calledWithErrors(res.send)
      sinon.assert.notCalled(fakeTxn.commit)
      sinon.assert.calledOnce(fakeTxn.rollback)
    })
  })

  describe('createAPIversion', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        api_findByPk: sinon.stub(Api, 'findByPk'),
        apiVersion_create: sinon.stub(ApiVersion, 'create'),
        validateSwagger: sinon.stub(swaggerUtil, 'validateSwagger'),
        getStorageClient: sinon.stub(Storage, 'getStorageClient'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      params: {
        apiId: 1,
      },
      formdata: {
        files: { file: { path: path.join(__dirname, '../util/petstore3.json') } },
      },
    }

    it('should return 400 if a file is not uploaded', async () => {
      const req = mockRequest({
        params: {
          apiId: 1,
        },
        formdata: {},
      })
      const res = mockResponse()

      await createAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })

    it('should return 400 if the contract file is invalid', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.validateSwagger.resolves({
        errors: ['err1'],
      })

      await createAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })

    it('should return 500 when storage fails to save the file', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.validateSwagger.resolves({
        errors: [],
        api: {
          info: {
            title: 'pets',
            version: '1234',
          },
        },
      })
      const mockData = { id: 1, ...mockReq.body }
      stubs.api_findByPk.resolves({ dataValues: { id: 1 } })
      stubs.apiVersion_create.resolves(mockData)
      stubs.getStorageClient.returns({
        saveFile: sinon.stub().resolves({ error: 'failed' }),
      })

      await createAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })

    it('should return 201 and return the new entity', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.validateSwagger.resolves({
        errors: [],
        api: {
          info: {
            title: 'pets',
            version: '1234',
          },
        },
      })
      const mockData = { id: 1, ...mockReq.body }
      stubs.api_findByPk.resolves({ dataValues: { id: 1 } })
      stubs.apiVersion_create.resolves(mockData)
      stubs.getStorageClient.returns({
        saveFile: sinon.stub().resolves({ error: null }),
      })

      await createAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CREATED)
    })
  })

  describe('updateAPIversion', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        update: sinon.stub(ApiVersion, 'update'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      params: {
        id: 1,
        apiId: 8,
      },
      body: {
        title: 'ACME API v2',
        version: 'v2.4',
        scope: 'scope',
        production_enabled: false,
        sandbox_enabled: false,
      },
    }

    it('should return 404 if the API or version is not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([0, []])

      await updateAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 200 and the updated entity', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([1, [{}]])

      await updateAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, sinon.match.object)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.rejects()

      await updateAPIversion(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('publishAPI', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        update: sinon.stub(Api, 'update'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = { params: { id: 1 } }

    it('should return 404 if an API is not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([0, []])

      await setPublished(true)(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 204', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([1, []])

      await setPublished(true)(req, res)
      sinon.assert.calledWith(stubs.update, sinon.match({ publishedAt: sinon.match.date }), sinon.match.object)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.rejects()

      await setPublished(true)(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('unpublishAPI', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        update: sinon.stub(Api, 'update'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = { params: { id: 1 } }

    it('should return 404 if an API is not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([0, []])

      await setPublished(false)(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 204', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([1, []])

      await setPublished(false)(req, res)
      sinon.assert.calledWith(stubs.update, sinon.match({ publishedAt: null }), sinon.match.object)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
    })

    it('should return 500 and errors when something fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.rejects()

      await setPublished(false)(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })
})
