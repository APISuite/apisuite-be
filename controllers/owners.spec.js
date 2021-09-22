const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../util/test-helpers')
const { models, sequelize } = require('../models')
const { v4: uuidv4 } = require('uuid')
const organization = models.Organization
const inviteOrganization = models.InviteOrganization
const role = models.Role
const api = models.Api
const apiVersion = models.ApiVersion
const {
  get,
  setup,
} = require('./owner')
const { stub } = require('sinon')
const enums = require('../util/enums')


describe('Owners', () => {
  describe('get', () => {
    let stubs = {}
    beforeEach(() => {
      stubs = {
        getOwnerOrganization: sinon.stub(organization, 'getOwnerOrganization'),
        findByPk: sinon.stub(organization, 'findByPk'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return 200 and Organization', async () => {
      const mockReq = ''
      const mockData = 'abcde'

      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.getOwnerOrganization.resolves(mockData)
      await get(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, mockData)
    })
  })
})

describe('setup', () => {
  let stubs = {}
  const fakeTxn = {
    commit: sinon.spy(async () => undefined),
    rollback: sinon.spy(async () => undefined),
    _reset: function () {
      this.commit.resetHistory()
      this.rollback.resetHistory()
    },
  }

  const apiReq = {
    name: 'abcde',
    baseUri: 'https://example.petstore.io/',
    docs: [
      {
        title: 'abcde',
        info: 'qwertyuio',
        target: 'zxcvbnm',
      },
    ],
    publishedAt: new Date(),
  }

  const mockData = {
    user_id: null,
    org_id: '12345',
    role_id: '12345',
    email: 'abcde@abcde.org',
    status: 'pending',
    confirmation_token: uuidv4(),
  }

  beforeEach(() => {
    stubs = {
      create: sinon.stub(organization, 'create'),
      query: sinon.stub(sequelize, 'query').resolves('1111'),
      findModel: sinon.stub(role, 'findOne').resolves('aaaa'),
      createInvite: sinon.stub(inviteOrganization, 'create').resolves(mockData),
      apiCreate: sinon.stub(api, 'create').resolves(apiReq),
      apiVersionCreate: sinon.stub(apiVersion, 'create').resolves({ api: { id: '11111' } }),
      transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  const mockReq = {
    body: {
      email: 'abcde@abcde.org',
      organization: {
        name: 'abcde',
        website: 'abcde.org',
        vat: '123456789',
        org_code: uuidv4(),
      },
    },
  }

  it('should return 200 and Invite', async () => {
    const req = mockRequest(mockReq)
    const res = mockResponse()
    stubs.create.resolves(mockData)
    await setup(req, res)
    sinon.assert.calledWith(res.status, HTTPStatus.OK)
  })
})
