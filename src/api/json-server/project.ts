import { mande } from 'mande'
import { getCurrentUser } from './auth'
import config from './config'
import handleError from './handleError'
import type { Project } from '~/models/Project'

export type OnChangeProjectCb = (p: Project, reason: 'created' | 'modified' | 'removed') => void
export type OnErrorProjectCb = (err: any) => void

const { collections: { projects: { path } } } = config

const subs = new Map<string, [Set<OnChangeProjectCb>, Set<OnErrorProjectCb>]>()

export const createProject = async (p: any) => {
  const user = getCurrentUser()
  if (!user)
    throw new Error('error.notAuth')

  const api = mande(`${path}`)
  const { id: ownerId } = user
  const createdAt = new Date().toJSON()
  const updatedAt = createdAt
  try {
    return await api.post<Project>({
      ...p,
      ownerId,
      createdAt,
      updatedAt,
    })
  }
  catch (err) {
    const error = handleError(err)
    throw error
  }
}

export const subscribe = (id: string, c: OnChangeProjectCb, e: OnErrorProjectCb) => {
  id = String(id)
  const s = subs.get(id)
  if (!s) {
    subs.set(id, [new Set<OnChangeProjectCb>().add(c), new Set<OnErrorProjectCb>().add(e)])
  }
  else {
    s[0].add(c)
    s[1].add(e)
  }
}

const unsubscribe = (id: string, c: OnChangeProjectCb, e: OnErrorProjectCb) => {
  id = String(id)
  const s = subs.get(id)
  if (!s)
    return

  s[0].delete(c)
  s[1].delete(e)
  if (s[0].size === 0 && s[1].size === 0)
    subs.delete(id)
}

export const useProject = (_id: string) => {
  const id = String(_id)

  const api = mande(`${path}/${id}`)

  const load = async () => {
    try {
      const project = await api.get<Project>('', { query: { active: true } })

      // json-server not implemented such queries, so..
      const user = getCurrentUser()
      if (!user)
        throw new Error('Authorization required!')
      if (project.ownerId !== user.id || project.membersIds?.includes(user.id))
        throw new Error('Access denied!')

      const s = subs.get(id)
      s && s[0].forEach(cb => cb(project, 'modified'))
      return project
    }
    catch (err: any) {
      const error = handleError(err)
      const s = subs.get(id)
      s && s[1].forEach(cb => cb(error.message))
      throw error
    }
  }

  const update = async (project: Project) => {
    try {
      const p = await api.put<Project>({ ...project, updatedAt: new Date().toJSON() })
      const s = subs.get(id)
      s && s[0].forEach(cb => cb(p, 'modified'))
      return p
    }
    catch (err: any) {
      const error = handleError(err)
      const s = subs.get(id)
      s && s[1].forEach(cb => cb(error.message))
      throw error
    }
  }

  const patch = async (data: any) => {
    try {
      const p = await api.patch<Project>({ ...data, updatedAt: new Date().toJSON() })
      const s = subs.get(id)
      s && s[0].forEach(cb => cb(p, 'modified'))
      return p
    }
    catch (err: any) {
      const error = handleError(err)
      const s = subs.get(id)
      s && s[1].forEach(cb => cb(error.message))
      throw error
    }
  }

  const remove = async () => {
    try {
      const p = await api.delete<Project>(id)
      const s = subs.get(id)
      s && s[0].forEach(cb => cb(p, 'removed'))
      return p
    }
    catch (err: any) {
      const error = handleError(err)
      const s = subs.get(id)
      s && s[1].forEach(cb => cb(error.message))
      throw error
    }
  }

  return {
    load,
    subscribe: (c: OnChangeProjectCb, e: OnErrorProjectCb) => subscribe(id, c, e),
    unsubscribe: (c: OnChangeProjectCb, e: OnErrorProjectCb) => unsubscribe(id, c, e),
    update,
    patch,
    remove,
  }
}
