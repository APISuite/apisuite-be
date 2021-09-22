const crypto = require('crypto')
const config = require('../config')

const algorithm = 'aes-192-cbc'
const password = config.get('cipherPassword')
const key = crypto.scryptSync(password, 'salt', 24)
const iv = Buffer.alloc(16, 0)

const cipher = (text) => {
  const c = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = c.update(text, 'utf8', 'hex')
  encrypted += c.final('hex')

  return encrypted
}

const decipher = (encrypted) => {
  const d = crypto.createDecipheriv(algorithm, key, iv)

  let decrypted = d.update(encrypted, 'hex', 'utf8')
  decrypted += d.final('utf8')

  return decrypted
}

module.exports = {
  cipher,
  decipher,
}
