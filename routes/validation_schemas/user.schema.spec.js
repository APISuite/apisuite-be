const sinon = require('sinon')
const chai = require('chai')
const assert = chai.assert
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validatePassword,
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
})
