import { defaults, mande } from 'mande'
import config from './config'
import type { User } from '~/models/User'

const authApi = mande(config.auth.path)
const { login: loginPath } = config.auth

const register = async () => {
  throw new Error('Not implemented')
}

type AuthCallback = (user: User | null) => void
const authCallBacks = new Set<AuthCallback>()

let currentUser: User | null = null

const login = async (email: string, password: string): Promise<User> => {
  const { access_token: token, id } = await authApi.post<{ access_token: string; id: string | number }>(loginPath, { email, password })
    .catch((err) => {
      console.error(err)
      const message = err instanceof TypeError
        ? 'Network error'
        : err.body?.message || err.message
      throw new Error(message)
    })

  localStorage.setItem('user', JSON.stringify({ id, email, token }))
  defaults.headers.Authorization = `Bearer ${token}`
  currentUser = { email, token, id }
  authCallBacks.forEach(cb => cb(currentUser))

  return { email, token, id }
}

const logout = () => {
  localStorage.removeItem('user')
  currentUser = null
  defaults.headers.Authorization = ''
  authCallBacks.forEach(cb => cb(currentUser))
  return true
}

const authInit = async (cb: AuthCallback) => {
  authCallBacks.add(cb)
  let user: User | null = null
  const userData = localStorage.getItem('user')
  if (userData) {
    user = JSON.parse(userData)
    if (user?.token) { defaults.headers.Authorization = `Bearer ${user?.token}` }
    else {
      localStorage.removeItem('user')
      user = null
    }
  }
  currentUser = user
  authCallBacks.forEach(cb => cb(currentUser))
  return user
}

const getCurrentUser = () => currentUser

const subscribe = (cb: AuthCallback) => {
  authCallBacks.add(cb)
}

const unsubscribe = (cb: AuthCallback) => {
  authCallBacks.delete(cb)
}

setInterval(() => {
  if (!currentUser)
    return
  authApi.get<User>(loginPath)
    .then(u => currentUser = u)
    .catch(() => {
      logout()
    })
}, 600000)

export {
  authInit,
  login,
  logout,
  register,
  getCurrentUser,
  subscribe,
  unsubscribe,
}
