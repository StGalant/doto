import type { User } from 'firebase/auth'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from './config'
import type { User as UserModel } from '~/models/User'

type AuthCallback = (user: UserModel | null) => void
const authCallBacks = new Set<AuthCallback>()

let currentUser: UserModel | null = null

function userToModel(user: User): UserModel {
  return { id: user.uid, email: user.email ?? '', token: 'firebase token', displayName: user.displayName ?? undefined }
}

onAuthStateChanged(auth, (user) => {
  if (user)
    currentUser = userToModel(user)
  else
    currentUser = null

  authCallBacks.forEach(cb => cb(currentUser))
})

const subscribe = (cb: AuthCallback) => {
  authCallBacks.add(cb)
}

const unsubscribe = (cb: AuthCallback) => {
  authCallBacks.delete(cb)
}

const authInit = async (cb: AuthCallback) => {
  subscribe(cb)
}

const login = async (email: string, password: string) => {
  const resp = await signInWithEmailAndPassword(auth, email, password)
  return userToModel(resp.user)
}

const logout = () => {
  signOut(auth)
}

const register = async (email: string, password: string) => {
  const resp = await createUserWithEmailAndPassword(auth, email, password)
  return userToModel(resp.user)
}

const getCurrentUser = () => currentUser

export {
  authInit,
  login,
  logout,
  register,
  getCurrentUser,
  subscribe,
  unsubscribe,
}
