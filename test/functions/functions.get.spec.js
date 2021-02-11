// set env to test
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHTTP = require('chai-http')
const { stub } = require('sinon')
const Chance = require('chance')
const chance = new Chance()

const server = require('../../app')
const { models } = require('../../models')
const Functions = models.Functions

const should = chai.should()
const assert = chai.assert

chai.use(chaiHTTP)

describe('Functions', () => {
  let findAll = {}

  beforeEach(() => {
    findAll = stub(Functions, 'findAll')
  })

  afterEach(() => {
    findAll.restore()
  })

  describe('GET /functions [200]', () => {
    it('should get the functions successfully', (done) => {
      const funcs = [{
        microservice_url: chance.integer({ min: 1, max: 10 }),
        ms_service_name: chance.email(),
        ms_host_name: chance.name(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }]
      findAll.resolves(funcs)

      chai.request(server)
        .get('/functions')
        .set('x-internal-token', 'U3VwM3JTM0NyMzdQNCQkLWYwci00ZE0xTg==')
        .end((err, res) => {
          if (err) done()
          res.should.have.status(200)
          res.body.should.eql(funcs)
          done()
        })
    })
  })

  describe('GET /functions [403]', () => {
    it('should fail with a 403 status', (done) => {
      chai.request(server)
        .get('/functions')
        .end((err, res) => {
          if (err) done()
          res.should.have.status(403)
          res.body.should.haveOwnProperty('errors')
          done()
        })
    })
  })

  describe('GET /functions [500]', () => {
    it('should fail with a 500 status', (done) => {
      findAll.throws()

      chai.request(server)
        .get('/functions')
        .set('x-internal-token', 'U3VwM3JTM0NyMzdQNCQkLWYwci00ZE0xTg==')
        .end((err, res) => {
          if (err) done()
          res.should.have.status(500)
          res.body.should.haveOwnProperty('errors')
          done()
        })
    })
  })
})
