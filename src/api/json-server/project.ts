import { mande } from 'mande'
import { getCurrentUser } from './auth'
import config from './config'
import handleError from './handleError'
import type { Project } from '~/models/Project'

export type OnChangeProjectCb = (p: Project, changeType: 'created' | 'modified' | 'removed') => void
export type OnErrorProjectCb = (err: any) => void

export const useProject = (_id: string, onChange?: OnChangeProjectCb, onError?: OnErrorProjectCb) => {
  const { collections: { projects: { path } } } = config
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

  const load = async (onChange?: OnChangeProjectCb, onError?: OnErrorProjectCb) => {
    subscribe(onChange, onError)
    try {
      const project = await api.get<Project>(id, { query: { active: true } })

      // json-server not implemented such queries, so..
      const user = getCurrentUser()
      if (!user)
        throw new Error('Authorization required!')
      if (project.ownerId !== user.id || project.membersIds.includes(user.id))
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
      const p = await api.put<Project>(project)
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
      const p = await api.patch<Project>(data)
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

export const createProject = async (project: Project, onChange?: OnChangeProjectCb, onError?: OnErrorProjectCb) => {
  const { collections: { projects: { path } } } = config
  const api = mande(`${path}`)

  try {
    const newProject = await api.post<Project>(project)
    if (onChange)
      onChange(newProject, 'created')
    const newApi = useProject(newProject.id, onChange, onError)
    return newApi
  }
  catch (err: any) {
    const error = handleError(err)
    if (onError)
      onError(err.message)
    throw error
  }
}
