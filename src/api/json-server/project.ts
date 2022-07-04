import { mande } from 'mande'
import { getCurrentUser } from './auth'
import config from './config'
import handleError from './handleError'
import type { Project } from '~/models/Project'

export type OnChangeProjectCb = (p: Project, changeType: 'created' | 'modified' | 'removed') => void
export type OnErrorProjectCb = (err: any) => void

const { collections: { projects: { path } } } = config

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

export const useProject = (_id: string, onChange?: OnChangeProjectCb, onError?: OnErrorProjectCb) => {
  const id = _id

  const api = mande(`${path}/${id}`)

  const projectChangeCb = new Set<OnChangeProjectCb>()
  const projectErrorCb = new Set<OnErrorProjectCb>()

  const subscribe = (c?: OnChangeProjectCb, e?: OnErrorProjectCb) => {
    if (c)
      projectChangeCb.add(c)
    if (e)
      projectErrorCb.add(e)
  }

  subscribe(onChange, onError)

  const unsubscribe = (c?: OnChangeProjectCb, e?: OnErrorProjectCb) => {
    if (c)
      projectChangeCb.delete(c)
    if (e)
      projectErrorCb.delete(e)
  }

  const load = async () => {
    try {
      const project = await api.get<Project>('', { query: { active: true } })

      // json-server not implemented such queries, so..
      const user = getCurrentUser()
      if (!user)
        throw new Error('Authorization required!')
      if (project.ownerId !== user.id || project.membersIds?.includes(user.id))
        throw new Error('Access denied!')

      projectChangeCb.forEach(cb => cb(project, 'modified'))
      return project
    }
    catch (err: any) {
      const error = handleError(err)
      projectErrorCb.forEach(cb => cb(error.message))
      throw error
    }
  }

  const update = async (project: Project) => {
    try {
      const p = await api.put<Project>({ ...project, updatedAt: new Date().toJSON() })
      projectChangeCb.forEach(cb => cb(p, 'modified'))
      return p
    }
    catch (err: any) {
      const error = handleError(err)
      projectErrorCb.forEach(cb => cb(error.message))
      throw error
    }
  }

  const patch = async (data: any) => {
    try {
      const p = await api.patch<Project>({ ...data, updatedAt: new Date().toJSON() })
      projectChangeCb.forEach(cb => cb(p, 'modified'))
      return p
    }
    catch (err: any) {
      const error = handleError(err)
      projectErrorCb.forEach(cb => cb(error.message))
      throw error
    }
  }

  const remove = async () => {
    try {
      const p = await api.delete<Project>(id)
      projectChangeCb.forEach(cb => cb(p, 'removed'))
      return p
    }
    catch (err: any) {
      const error = handleError(err)
      projectErrorCb.forEach(cb => cb(error.message))
      throw error
    }
  }

  return {
    load,
    subscribe,
    unsubscribe,
    update,
    patch,
    remove,
  }
}
