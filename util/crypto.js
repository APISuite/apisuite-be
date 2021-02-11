const crypto = require('crypto')
const config = require('../config')

const algorithm = 'aes-192-cbc'
const password = config.get('cipherPassword')
const key = crypto.scryptSync(password, 'salt', 24)
const iv = Buffer.alloc(16, 0)

const cipher = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}

const decipher = (encrypted) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

module.exports = {
  cipher,
  decipher,
}
