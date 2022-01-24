const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../util/test-helpers')
const { models } = require('../models')
const User = models.User
const InviteOrganization = models.InviteOrganization
const {
  confirmRegistration,
  validateInvitation,
} = require('./registration')
const Chance = require('chance')
const chance = new Chance()

describe('Registration', () => {
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
        email: chance.email({ domain: 'example.com' }),
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
