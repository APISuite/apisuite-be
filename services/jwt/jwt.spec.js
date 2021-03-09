const sinon = require('sinon')
const jsonwebtoken = require('jsonwebtoken')
const { expect } = require('chai')
const jwt = require('./index')
const config = require('../../config')

describe('jwt', () => {
  beforeEach(() => {
    sinon.stub(config, 'get')
      .withArgs('auth.accessTokenTTL').returns(1)
      .withArgs('auth.tokenIssuer').returns('test.apisuite.io')
      .withArgs('auth.accessTokenSecret').returns('supersecret')
      .withArgs('auth.refreshTokenBytes').returns(256)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('signAccessToken', () => {
    it('should return a valid token', () => {
      const token = jwt.signAccessToken(666, { extra: 'NotB' })
      const decoded = jsonwebtoken.verify(token, 'supersecret')
      expect(decoded).to.be.an('object')
      expect(decoded.extra).to.equal('NotB')
      expect(decoded.iss).to.equal('test.apisuite.io')
      expect(decoded.sub).to.equal('666')
      expect(() => {
        jsonwebtoken.verify(token, 'wrongsecret')
      }).to.throw()
    })
  })

  describe('generateRefreshToken', () => {
    it('should return random tokens', async () => {
      const promises = []
      for (let t = 0; t < 10; t++) {
        promises.push(jwt.generateRefreshToken())
      }

      const tokens = await Promise.all(promises)
      expect(tokens).to.satisfy((arr) => new Set(arr).size === arr.length)
    })
  })
})
