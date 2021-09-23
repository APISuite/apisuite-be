const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { models, sequelize } = require('../models')
const { roles } = require('../util/enums')
const helpers = require('../util/test-helpers')
const UserOrganization = models.UserOrganization
const Role = models.Role
const {
  removeUserFromOrganization,
  changeUserRole,
} = require('./organization')

describe('Organization', () => {
  describe('removeUserFromOrganization', () => {
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
        userOrganization_findAll: sinon.stub(UserOrganization, 'findAll'),
        userOrganization_update: sinon.stub(UserOrganization, 'update').resolves(),
        userOrganization_destroy: sinon.stub(UserOrganization, 'destroy'),
        userOrganization_count: sinon.stub(UserOrganization, 'count'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    it('should return 204 when an org owner removes a user', async () => {
      stubs.userOrganization_destroy.resolves()
      stubs.userOrganization_findAll.resolves([{ org_id: 1 }])
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
        },
        user: {
          id: 1,
          organizations: [{ id: 1, role: { name: roles.ORGANIZATION_OWNER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await removeUserFromOrganization(req, res)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 204 when an admin/orgOwner removes itself', async () => {
      stubs.userOrganization_count.resolves(5)
      stubs.userOrganization_findAll.resolves([{ org_id: 1 }])
      stubs.userOrganization_destroy.resolves()
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
        },
        user: {
          id: 666,
          organizations: [{ id: 1, role: { id: 200, name: roles.ADMIN } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await removeUserFromOrganization(req, res)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 204 when a developer removes itself', async () => {
      stubs.userOrganization_findAll.resolves([{ org_id: 1 }])
      stubs.userOrganization_destroy.resolves()
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
        },
        user: {
          id: 666,
          organizations: [{ id: 1, role: { name: roles.DEVELOPER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await removeUserFromOrganization(req, res)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
      sinon.assert.calledOnce(fakeTxn.commit)
      sinon.assert.notCalled(fakeTxn.rollback)
    })

    it('should return 403 when the user is a developer trying to remove another user', async () => {
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
        },
        user: {
          id: 90000,
          organizations: [{ id: 1, role: { name: roles.DEVELOPER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await removeUserFromOrganization(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
      sinon.assert.calledOnce(fakeTxn.rollback)
      sinon.assert.notCalled(fakeTxn.commit)
    })

    it('should return 403 when the user is removing itself from a wrong org', async () => {
      const mockReq = {
        params: {
          id: 1000,
          userId: 666,
        },
        user: {
          id: 666,
          organizations: [{ id: 1, role: { name: roles.DEVELOPER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await removeUserFromOrganization(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
      sinon.assert.calledOnce(fakeTxn.rollback)
      sinon.assert.notCalled(fakeTxn.commit)
    })

    it('should return 403 when the user is an admin/orgOwner removing itself but is the last admin/orgOwner', async () => {
      stubs.userOrganization_count.resolves(0)
      stubs.userOrganization_destroy.resolves()
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
        },
        user: {
          id: 666,
          organizations: [{ id: 1, role: { name: roles.ORGANIZATION_OWNER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await removeUserFromOrganization(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
      sinon.assert.calledOnce(fakeTxn.rollback)
      sinon.assert.notCalled(fakeTxn.commit)
    })
  })

  describe('changeUserRole', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        role_findByPk: sinon.stub(Role, 'findByPk'),
        userOrganization_update: sinon.stub(UserOrganization, 'update').resolves(),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return 204 when role update is successful', async () => {
      stubs.role_findByPk.resolves({
        id: 10,
        level: 20,
      })
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
          roleId: 10,
        },
        user: {
          id: 1,
          organizations: [{ id: 1, role: { name: roles.ORGANIZATION_OWNER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await changeUserRole(req, res)
      sinon.assert.calledWith(res.sendStatus, HTTPStatus.NO_CONTENT)
    })

    it('should return 403 when the user tries to change own role', async () => {
      const mockReq = {
        params: {
          id: 1,
          userId: 1,
          roleId: 10,
        },
        user: {
          id: 1,
          organizations: [{ id: 1, role: { name: roles.DEVELOPER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await changeUserRole(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
    })

    it('should return 403 when the user is changing a role in org without access', async () => {
      const mockReq = {
        params: {
          id: 1000,
          userId: 666,
          roleId: 10,
        },
        user: {
          id: 1,
          organizations: [{ id: 1, role: { name: roles.DEVELOPER } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await changeUserRole(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
    })

    it('should return 404 when the user tries to assign an unexisting role', async () => {
      stubs.role_findByPk.resolves(null)
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
          roleId: 10,
        },
        user: {
          id: 1,
          organizations: [{ id: 1, role: { name: roles.ORGANIZATION_OWNER, level: 200 } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await changeUserRole(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
      helpers.calledWithErrors(res.send)
    })

    it('should return 403 when the user tries to assign a role with higher hierarchy level', async () => {
      stubs.role_findByPk.resolves({
        id: 10,
        level: 1,
      })
      const mockReq = {
        params: {
          id: 1,
          userId: 666,
          roleId: 10,
        },
        user: {
          id: 1,
          organizations: [{ id: 10, role: { name: roles.ORGANIZATION_OWNER, level: 200 } }],
        },
      }
      const req = mockRequest(mockReq)
      const res = mockResponse()

      await changeUserRole(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.FORBIDDEN)
      helpers.calledWithErrors(res.send)
    })
  })
})
