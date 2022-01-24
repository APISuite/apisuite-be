const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validateUserConfirmBody,
  validateUserRegistrationInvitationBody,
} = require('./registration.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('Registration Validations', () => {
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
