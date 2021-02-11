const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../test/helpers')
const { models, sequelize } = require('../models')
const emailService = require('./email')
const User = models.User
const Role = models.Role
const Organization = models.Organization
const InviteOrganization = models.InviteOrganization
const UserRegistration = models.UserRegistration
const UserOrganization = models.UserOrganization
const {
  setUserDetails,
  setOrganizationDetails,
  completeRegistration,
  confirmRegistration,
  validateInvitation,
} = require('./registration')
const Chance = require('chance')
const chance = new Chance()

describe('Registration', () => {
  describe('setUserDetails', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        user_findByLogin: sinon.stub(User, 'findByLogin'),
        invite_findByConfirmationToken: sinon.stub(InviteOrganization, 'findByConfirmationToken'),
        registration_create: sinon.stub(UserRegistration, 'create'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      body: {
        name: chance.name(),
        email: chance.email(),
      },
      user: { org: { id: 100 } },
    }

    it('should return 201 if the user details were created', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByLogin.resolves()
      stubs.registration_create.resolves()

      await setUserDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CREATED)
    })

    it('should return 409 if the email exist found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByLogin.resolves({ email: mockReq.body.email })

      await setUserDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CONFLICT)
      helpers.calledWithErrors(res.send)
    })

    it('should return 500 if the data can\'t be saved', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_create.rejects()

      await setUserDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('setOrganizationDetails', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        org_findOne: sinon.stub(Organization, 'findOne'),
        registration_findByPk: sinon.stub(UserRegistration, 'findByPk'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      registrationToken: chance.guid({ version: 4 }),
      body: {
        name: chance.company(),
        website: chance.url(),
        vat: chance.string({ length: 9, numeric: true }),
      },
      user: { org: { id: 100 } },
    }

    it('should return 200 if the organization data was saved', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({ save: () => { return Promise.resolve() }, createdAt: Date.now() })
      stubs.org_findOne.resolves()

      await setOrganizationDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 401 if registration not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves()

      await setOrganizationDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.UNAUTHORIZED)
    })

    it('should return 401 if registration expired', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({ destroy: () => { return Promise.resolve() }, createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) })

      await setOrganizationDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.UNAUTHORIZED)
    })

    it('should return 409 if organization already exists', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({ save: () => { return Promise.resolve() }, createdAt: Date.now() })
      stubs.org_findOne.resolves({})

      await setOrganizationDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.CONFLICT)
      helpers.calledWithErrors(res.send)
    })

    it('should return 500 if the organization data was not saved', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({ save: () => { return Promise.reject(new Error()) }, createdAt: Date.now() })
      stubs.org_findOne.resolves()

      await setOrganizationDetails(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('completeRegistration', () => {
    let stubs = {}
    const fakeTxn = helpers.getFakeTxn()

    beforeEach(() => {
      stubs = {
        org_findOne: sinon.stub(Organization, 'findOne'),
        registration_findByPk: sinon.stub(UserRegistration, 'findByPk'),
        invite_findByConfirmationToken: sinon.stub(InviteOrganization, 'findByConfirmationToken'),
        org_create: sinon.stub(Organization, 'create'),
        user_create: sinon.stub(User, 'create'),
        user_org_create: sinon.stub(UserOrganization, 'create'),
        invite_destroy: sinon.stub(UserRegistration, 'destroy'),
        role_findOne: sinon.stub(Role, 'findOne'),
        email_send_register_confirmation: sinon.stub(emailService, 'sendRegisterConfirmation'),
        transaction: sinon.stub(sequelize, 'transaction').resolves(fakeTxn),
      }
    })

    afterEach(() => {
      fakeTxn._reset()
      sinon.restore()
    })

    const mockReq = {
      registrationToken: chance.guid({ version: 4 }),
      body: {
        password: chance.string({ length: 12 }),
      },
      user: { org: { id: 100 } },
    }

    it('should return 200 if the registration is complete', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({
        id: chance.natural({ min: 1, max: 20 }),
        name: chance.name(),
        email: chance.email(),
        organizationName: chance.company(),
        organizationVat: chance.string({ length: 9, numeric: true }),
        organizationWebsite: chance.url(),
        createdAt: Date.now(),
        get: function () { return this },
      })
      stubs.invite_findByConfirmationToken.resolves()
      stubs.org_create.resolves({ id: chance.natural({ min: 1, max: 20 }) })
      stubs.user_create.resolves({
        id: chance.natural({ min: 1, max: 20 }),
        role_id: 2,
      })
      stubs.user_org_create.resolves()
      stubs.invite_destroy.resolves()
      stubs.email_send_register_confirmation.resolves()
      stubs.role_findOne.resolves({ id: 1234 })

      await completeRegistration(req, res)
      sinon.assert.called(fakeTxn.commit)
      sinon.assert.calledWith(res.status, HTTPStatus.CREATED)
    })

    it('should return 200 if the registration is complete [invite]', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      const userEmail = chance.email()
      const roleId = parseInt(chance.string({ length: 1, pool: '123' }))
      stubs.registration_findByPk.resolves({
        id: chance.natural({ min: 1, max: 20 }),
        name: chance.name(),
        email: userEmail,
        organizationName: chance.company(),
        organizationVat: chance.string({ length: 9, numeric: true }),
        organizationWebsite: chance.url(),
        createdAt: Date.now(),
        get: function () { return this },
      })
      stubs.invite_findByConfirmationToken.resolves({
        email: userEmail,
        org_id: 100,
        role_id: roleId,
        save: () => Promise.resolve(),
      })
      stubs.user_create.resolves({
        id: chance.natural({ min: 1, max: 20 }),
        role_id: roleId,
      })
      stubs.user_org_create.resolves()
      stubs.invite_destroy.resolves()
      stubs.email_send_register_confirmation.resolves()
      stubs.role_findOne.resolves({ id: 1234 })

      await completeRegistration(req, res)
      sinon.assert.called(fakeTxn.commit)
      sinon.assert.calledWith(res.status, HTTPStatus.CREATED)
    })

    it('should return 401 if registration not found', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves()

      await completeRegistration(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.UNAUTHORIZED)
    })

    it('should return 401 if registration expired', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({ destroy: () => Promise.resolve(), createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) })

      await completeRegistration(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.UNAUTHORIZED)
    })

    it('should return 500 when creating organization data', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.registration_findByPk.resolves({
        id: chance.natural({ min: 1, max: 20 }),
        name: chance.name(),
        email: chance.email(),
        organizationName: chance.company(),
        organizationVat: chance.string({ length: 9, numeric: true }),
        organizationWebsite: chance.url(),
        createdAt: Date.now(),
        get: function () { return this },
      })
      stubs.invite_findByConfirmationToken.resolves()
      stubs.org_create.rejects()

      await completeRegistration(req, res)
      sinon.assert.called(fakeTxn.rollback)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('confirmRegistration', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        user_findByActivationToken: sinon.stub(User, 'findByActivationToken'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      body: {
        token: chance.guid({ version: 4 }),
      },
    }

    it('should return 200 if the registration confirmed', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByActivationToken.resolves({ save: () => Promise.resolve() })

      await confirmRegistration(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 404 when confirmation token doesn\'t exist', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByActivationToken.resolves()

      await confirmRegistration(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.NOT_FOUND)
    })

    it('should return 500 when confirmation fails', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByActivationToken.resolves({ save: () => Promise.reject(new Error()) })

      await confirmRegistration(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('validateInvitation', () => {
    let stubs = {}

    beforeEach(() => {
      stubs = {
        invite_findByConfirmationToken: sinon.stub(InviteOrganization, 'findByConfirmationToken'),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      registrationToken: chance.guid({ version: 4 }),
    }

    it('should return 200 and user data if the invitation is valid', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.invite_findByConfirmationToken.resolves({
        email: chance.email(),
      })

      await validateInvitation(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 500 when it fails to get invitation data', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.invite_findByConfirmationToken.rejects()

      await validateInvitation(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.INTERNAL_SERVER_ERROR)
      helpers.calledWithErrors(res.send)
    })
  })
})
