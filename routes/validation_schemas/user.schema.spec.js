const sinon = require('sinon')
const chai = require('chai')
const assert = chai.assert
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validatePassword,
  validateRegisterBody,
  validateProfileUpdateBody,
  validateChangePasswordBody,
  validateSetupBody,
  validateNewAPITokenBody,
} = require('./user.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('User Validations', () => {
  describe('validatePassword', () => {
    describe('test invalid payloads', () => {
      const testData = [
        '',
        'short',
        'enoughtlength',
        'Enoughtlength',
      ]

      testData.forEach((pwd) => {
        it('should not validate and return errors', () => {
          const res = validatePassword(pwd)
          assert.isObject(res)
          assert.property(res, 'valid')
          assert.property(res, 'errors')
          assert.isArray(res.errors)
          assert.isFalse(res.valid)
          assert.isAbove(res.errors.length, 0)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        'Enoughtlength123!!',
        'sup3rP4ssw0rd%',
      ]

      testData.forEach((pwd) => {
        it('should validate', () => {
          const res = validatePassword(pwd)
          assert.isObject(res)
          assert.property(res, 'valid')
          assert.property(res, 'errors')
          assert.isArray(res.errors)
          assert.isTrue(res.valid)
          assert.equal(res.errors.length, 0)
        })
      })
    })
  })

  describe('validateRegisterBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { email: 12341 } },
        { body: { email: null } },
        { body: { email: '' } },
        { body: { email: 'imnotanemail.com' } },
        { body: { email: 'someemail@fake.pp', name: 1234 } },
        { body: { email: 'someemail@fake.pp', password: null } },
        { body: { email: 'someemail@fake.pp', name: null, password: 76253 } },
        { body: { email: 'someemail@fake.pp', name: 'some name', password: 'invalidpassword' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateRegisterBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { email: chance.email({ domain: 'example.com' }), name: chance.string(), password: 'Sup3rPassw0rd!@$#' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateRegisterBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateProfileUpdateBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { name: 12341 } },
        { body: { name: chance.string(), bio: {}, avatar: 1234, mobile: 87 } },
        { body: { name: chance.string(), bio: chance.string(), avatar: 1234, mobile: 87 } },
        { body: { name: chance.string(), bio: chance.string(), avatar: chance.string(), mobile: 87 } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateProfileUpdateBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { name: chance.string() } },
        { body: { name: chance.string(), bio: chance.string() } },
        { body: { name: chance.string(), bio: chance.string(), avatar: chance.string() } },
        { body: { name: chance.string(), bio: chance.string(), avatar: chance.string(), mobile: chance.string() } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateProfileUpdateBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateChangePasswordBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { old_password: 12341 } },
        { body: { old_password: 12341, new_password: { } } },
        { body: { old_password: 'somepwd', new_password: 'invalid' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateChangePasswordBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { old_password: 'somepwd', new_password: 'V4l1dPassword!$' } },
        { body: { old_password: 'V4l1dPassword!$', new_password: 'V4l1dPassword!$' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateChangePasswordBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateSetupBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { email: 3423462 } },
        { body: { email: chance.string() } },
        { body: { email: chance.email({ domain: 'example.com' }), organization: { } } },
        { body: { email: chance.email({ domain: 'example.com' }), organization: { name: 123434 } } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSetupBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { email: chance.email({ domain: 'example.com' }), organization: { name: 'acme' } } },
        {
          body: {
            email: chance.email({ domain: 'example.com' }),
            organization: {
              name: 'acme',
            },
          },
        },
        {
          body: {
            email: chance.email({ domain: 'example.com' }),
            organization: {
              name: 'acme',
              website: chance.url(),
              vat: chance.string(),
            },
            settings: {
              portalName: chance.string(),
              clientName: chance.string(),
            },
          },
        },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSetupBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateNewAPITokenBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { name: 12341 } },
        { body: { name: {} } },
        { body: { name: [] } },
        { body: { name: '' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateNewAPITokenBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { name: 'mytoken' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateNewAPITokenBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
