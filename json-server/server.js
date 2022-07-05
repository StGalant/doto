/* eslint-disable no-console */
const fs = require('fs')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const YAML = require('yaml')

const server = jsonServer.create()
const router = jsonServer.router('json-server/db.json')
const userdb = YAML.parse(fs.readFileSync('json-server/users.yaml', 'utf-8'))

server.use(jsonServer.defaults())
server.use(bodyParser.json())
const SECRET_KEY = '1234567890'
const expiresIn = '1h'

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY)
}

function refreshToken(token) {
  try {
    const decodedToken = verifyToken(token)
    return createToken({ email: decodedToken.email, id: decodedToken.id })
  }
  catch (_err) {
    return null
  }
}

function isAuthenticated({ email, password }) {
  return userdb.users?.find(u => u.email === email && u.password === password)?.id
}

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  const id = isAuthenticated({ password, email })
  if (!id) {
    const status = 401
    const message = 'Incorrect email or password'
    res.status(status).json({ status, message })
  }
  else {
    const access_token = createToken({ email, id })
    res.status(200).json({ access_token, id })
  }
})

server.get('/auth/login', (req, res) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Bad authorization header'
    res.status(status).json({ status, message })
    return
  }
  const token = req.headers.authorization.split(' ')[1]
  const access_token = refreshToken(token)
  if (access_token)
    res.status(200).json({ access_token })

  else
    res.status(401).json({ status: 401, message: 'token cannot be refreshed' })
})

server.use(/^(?!\/auth).*$/, (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Bad authorization header'
    res.status(status).json({ status, message })
    return
  }
  try {
    verifyToken(req.headers.authorization.split(' ')[1])
    next()
  }
  catch (_err) {
    const status = 401
    const message = 'Error: access_token is not valid'
    res.status(status).json({ status, message })
  }
})

server.use(router)

server.use((req, res, next) => {
  const now = new Date().toJSON()
  if (req.method === 'POST')
    req.body.createdAt = now
  if (req.method === 'PATCH' || req.method === 'POST')
    req.body.updatedAt = now
  // Continue to JSON Server router
  next()
})

server.listen(7000, () => {
  console.log('JSON server listen on port 7000')
})
