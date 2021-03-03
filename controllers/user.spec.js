const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { models, sequelize } = require('../models')
const User = models.User
const UserOrganization = models.UserOrganization
const {
  setActiveOrganization,
  updateUserProfile,
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
})
