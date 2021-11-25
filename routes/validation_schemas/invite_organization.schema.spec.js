const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { validateInviteBody } = require('./invite_organization.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('Organization invite Validations', () => {
  describe('validateInviteBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { email: 12341 } },
        { body: { email: null } },
        { body: { email: '' } },
        { body: { email: 'imnotanemail.com' } },
        { body: { email: chance.email({ domain: 'example.com' }), role_id: null } },
        { body: { email: chance.email({ domain: 'example.com' }), role_id: 999 } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateInviteBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { email: chance.email({ domain: 'example.com' }), role_id: '1' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateInviteBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
