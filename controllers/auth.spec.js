const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { models } = require('../models')
const emailService = require('../services/email')
const User = models.User
const Organization = models.Organization
const PasswordRecovery = models.PasswordRecovery
const { forgotPassword } = require('./auth')

describe('Auth', () => {
  describe('forgotPassword', async () => {
    let stubs
    beforeEach(() => {
      stubs = {
        user_findByLogin: sinon.stub(User, 'findByLogin'),
        passwordRecovery_findLatest: sinon.stub(PasswordRecovery, 'findLatest'),
        passwordRecovery_create: sinon.stub(PasswordRecovery, 'create'),
        organization_getOwnerOrganization: sinon.stub(Organization, 'getOwnerOrganization'),
        emailService_sendRecoverPassword: sinon.stub(emailService, 'sendRecoverPassword').resolves(),
      }
    })

    afterEach(() => {
      sinon.restore()
    })

    const mockReq = {
      body: { email: 'fake@apisuite.io' },
    }

    it('should return 200 when there is no user with the provided email', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByLogin.resolves()

      await forgotPassword(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 200 when there user was not activated', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByLogin.resolves({
        activationToken: 'thisisamocktoken',
      })

      await forgotPassword(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 200 when user has a recent recovery request', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByLogin.resolves({ activationToken: null })
      stubs.passwordRecovery_findLatest.resolves({
        createdAt: new Date(),
      })

      await forgotPassword(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })

    it('should return 200 and send a recovery email', async () => {
      const req = mockRequest(mockReq)
      const res = mockResponse()
      stubs.user_findByLogin.resolves({ id: 1, activationToken: null })
      stubs.passwordRecovery_findLatest.resolves()
      stubs.passwordRecovery_create.resolves()
      stubs.organization_getOwnerOrganization.resolves({ logo: 'logourl' })
      stubs.emailService_sendRecoverPassword.resolves()

      await forgotPassword(req, res)
      sinon.assert.calledWith(res.status, HTTPStatus.OK)
    })
  })
})
