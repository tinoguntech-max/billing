const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'netbill_secret_key'

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token tidak ditemukan' })
  try {
    req.user = jwt.verify(header.slice(7), SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' })
  }
}

function role(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ error: 'Akses ditolak' })
    next()
  }
}

module.exports = { auth, role }
