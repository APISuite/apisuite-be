const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { models, sequelize } = require('../models')
const helpers = require('../util/test-helpers')
const msgBroker = require('../services/msg-broker')
const User = models.User
const UserOrganization = models.UserOrganization
const {
  setActiveOrganization,
  updateUserProfile,
  createSSOUser,
} = require('./user')

describe('User', () => {
  describe('setActiveOrganization', () => {
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
        update: sinon.stub(UserOrganization, 'update'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      params: {
        id: 1,
        orgId: 2,
      },
      user: {
        id: 1,
        organizations: [{ id: 2 }],
      },
    }

    it('should return 204 when update is successful', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves({})

      await setActiveOrganization(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NO_CONTENT)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 403 when the organization is invalid for the user', async () => {
      const req = mockRequest({
        params: {
          id: 1,
          orgId: 2222,
        },
        user: {
          id: 1,
          organizations: [{ id: 2 }],
        },
      })
      const res = mockResponse()

      await setActiveOrganization(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
    })

    it('should return 400 when the user id does not match the requester user id', async () => {
      const req = mockRequest({
        params: {
          id: 1000,
          orgId: 2,
        },
        user: {
          id: 1,
          organizations: [{ id: 2 }],
        },
      })
      const res = mockResponse()

      await setActiveOrganization(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
    })

    it('should return 500 when update fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({ sendInternalError: sinon.spy(() => undefined) })
      stubs.update.resolves(null)

      await setActiveOrganization(req, res)
      sinon.assert.called(res.sendInternalError)
      sinon.assert.notCalled(fakeTxn.commit)
      sinon.assert.calledOnce(fakeTxn.rollback)
    })
  })

  describe('updateUserProfile', () => {
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
        update: sinon.stub(User, 'update'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockUser = {
      name: 'john',
      bio: 'text',
      avatar: 'url',
      mobile: '1234',
      toProfileJSON: function () {
        return this
      },
    }

    const mockReq = {
      params: { id: 1 },
      user: { id: 1 },
      body: mockUser,
    }

    it('should return 200 when update is successful', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.update.resolves([1, [mockUser]])

      await updateUserProfile(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
      sinon.assert.calledWith(res.send, mockUser.toProfileJSON())
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 500 when update fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({ sendInternalError: sinon.spy(() => undefined) })
      stubs.update.rejects()

      await updateUserProfile(req, res)
      sinon.assert.called(res.sendInternalError)
      sinon.assert.notCalled(fakeTxn.commit)
      sinon.assert.calledOnce(fakeTxn.rollback)
    })
  })

  describe('createSSOUser', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        user_findByLogin: sinon.stub(User, 'findByLogin'),
        user_findByOIDC: sinon.stub(User, 'findByOIDC'),
        user_create: sinon.stub(User, 'create'),
        publishEvent: sinon.stub(msgBroker, 'publishEvent').resolves(),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      body: {
        name: 'john',
        email: 'email@bla.com',
        oidcId: 'as8d765fa8d',
        oidcProvider: 'keycloak',
      },
    }

    it('should return 403 when user is not admin', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: { isAdmin: false },
      })

      await createSSOUser(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
    })

    it('should return 409 when the email already exists', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: { isAdmin: true },
      })
      stubs.user_findByLogin.resolves({})

      await createSSOUser(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CONFLICT)
      helpers.calledWithErrors(res.send)
    })

    it('should return 409 when the oidc ID already exists', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: { isAdmin: true },
      })
      stubs.user_findByLogin.resolves(null)
      stubs.user_findByOIDC.resolves({})

      await createSSOUser(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CONFLICT)
      helpers.calledWithErrors(res.send)
    })

    it('should return 201 and the created user', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse({
        locals: { isAdmin: true },
      })
      stubs.user_findByLogin.resolves(null)
      stubs.user_findByOIDC.resolves(null)
      stubs.user_create.resolves(mockReq.body)

      await createSSOUser(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CREATED)
    })
  })
})
