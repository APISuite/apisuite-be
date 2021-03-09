const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validateUserDetailsBody,
  validateOrganizationDetailsBody,
  validateSecurityDetailsBody,
  validateUserConfirmBody,
  validateUserRegistrationInvitationBody,
} = require('./registration.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('Registration Validations', () => {
  describe('validateUserDetailsBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { email: 12341 } },
        { body: { email: null } },
        { body: { email: '' } },
        { body: { email: 'imnotanemail.com' } },
        { body: { email: chance.email(), name: null } },
        { body: { email: chance.email(), name: 999 } },
        { body: { email: chance.email(), name: chance.string(), token: {} } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateUserDetailsBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { email: chance.email(), name: chance.string() } },
        { body: { email: chance.email(), name: chance.string(), token: chance.string() } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateUserDetailsBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateOrganizationDetailsBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { registrationToken: 12341 } },
        { body: { registrationToken: null } },
        { body: { registrationToken: '' } },
        { body: { registrationToken: chance.string() } },
        { body: { registrationToken: chance.string(), name: 444 } },
        { body: { registrationToken: chance.guid({ version: 4 }), name: chance.string(), website: [] } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateOrganizationDetailsBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { registrationToken: chance.guid({ version: 4 }), name: chance.string() } },
        { body: { registrationToken: chance.guid({ version: 4 }), name: chance.string(), website: chance.url() } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateOrganizationDetailsBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateSecurityDetailsBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { registrationToken: 12341 } },
        { body: { registrationToken: null } },
        { body: { registrationToken: '' } },
        { body: { registrationToken: chance.guid({ version: 4 }) } },
        { body: { registrationToken: chance.guid({ version: 4 }), password: 444 } },
        { body: { registrationToken: chance.guid({ version: 4 }), password: 'invalid' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSecurityDetailsBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { registrationToken: chance.guid({ version: 4 }), password: 'V4l1dP4as&*%^$000' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSecurityDetailsBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateUserConfirmBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { token: 12341 } },
        { body: { token: null } },
        { body: { token: '' } },
        { body: { token: chance.string() } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateUserConfirmBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { token: chance.guid({ version: 4 }) } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateUserConfirmBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateUserRegistrationInvitationBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { token: 12341 } },
        { body: { token: null } },
        { body: { token: '' } },
        { body: { token: chance.string() } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateUserRegistrationInvitationBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { token: chance.guid({ version: 4 }) } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateUserRegistrationInvitationBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
