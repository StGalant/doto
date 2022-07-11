import { mande } from 'mande'
import * as authApi from './auth'
import config from './config'
import handleError from './handleError'
import type { Project } from '~/models/Project'

const { collections: { projects: { path } } } = config
const api = mande(path)

export type OnChangeProjectsListCb = (list: { project: Project; reason: 'created' | 'modified' | 'removed' }[]) => void
export type OnErrorProjectsListCb = (err: any) => void

const projectsListChangeCb = new Set<OnChangeProjectsListCb>()
const projectsListErrorCb = new Set<OnErrorProjectsListCb>()

export const subscribe = (c: OnChangeProjectsListCb, e: OnErrorProjectsListCb) => {
  projectsListChangeCb.add(c)
  projectsListErrorCb.add(e)
}

export const unsubscribe = (c: OnChangeProjectsListCb, e: OnErrorProjectsListCb) => {
  projectsListChangeCb.delete(c)
  projectsListErrorCb.delete(e)
}

// clear callbacks on user change
authApi.subscribe((_) => {
  projectsListChangeCb.clear()
  projectsListErrorCb.clear()
})
// load not only owned projects but also projects with current user's membership
export const load = async () => {
  try {
    const user = authApi.getCurrentUser()
    if (!user) { throw new Error('Authentication required') }
    else {
      const allProjects = await api.get<Project[]>('', { headers: { 'Cache-control': 'no-cache' } })
      // json-server not implemented such queries, so filter it here
      return allProjects.filter(p => (p.ownerId === user.id || p.membersIds.includes(String(user.id))))
    }
  }
  catch (err: any) {
    const error = handleError(err)
    projectsListErrorCb.forEach(cb => cb(error.message))
    throw error
  }
  return []
}
