import { mande } from 'mande'
import { getCurrentUser } from './auth'
import config from './config'
import handleError from './handleError'
import type { Project } from '~/models/Project'

const { collections: { projects: { path } } } = config
const api = mande(path)

export type OnChangeProjectsListCb = (p: Project[], changeType: 'created' | 'modified' | 'removed') => void
const projectsListChangeCb = new Set<OnChangeProjectsListCb>()
export type OnErrorProjectsListCb = (err: any) => void
const projectsListErrorCb = new Set<OnErrorProjectsListCb>()

export const loadCurrentProjects = async (onSnap?: OnChangeProjectsListCb, onErr?: OnErrorProjectsListCb) => {
  if (onSnap)
    projectsListChangeCb.add(onSnap)
  if (onErr)
    projectsListErrorCb.add(onErr)

  // json-server not implemented such queries, so..
  try {
    const user = getCurrentUser()
    if (!user)
      throw new Error('Authentication required')
    const allProjects = await api.get<Project[]>('')
    projectsListChangeCb.forEach(cb => cb(allProjects, 'modified'))
    return allProjects.filter(p => (p.ownerId === user.id || p.membersIds.includes(user.id)))
  }
  catch (err: any) {
    const error = handleError(err)
    projectsListErrorCb.forEach(cb => cb(error.message))
    throw error
  }
  return []
}

export const subCurrentProjects = (onSnap?: OnChangeProjectsListCb, onErr?: OnErrorProjectsListCb) => {
  if (onSnap)
    projectsListChangeCb.add(onSnap)
  if (onErr)
    projectsListErrorCb.add(onErr)
}

export const unsubCurrentProjects = (onSnap?: OnChangeProjectsListCb, onErr?: OnErrorProjectsListCb) => {
  if (onSnap)
    projectsListChangeCb.delete(onSnap)
  if (onErr)
    projectsListErrorCb.delete(onErr)
}
