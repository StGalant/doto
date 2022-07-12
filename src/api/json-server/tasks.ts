import { mande } from 'mande'
import config from './config'
import handleError from './handleError'
import type { Task } from '~/models/Task'

const { collections: { tasks: { path } } } = config
const api = mande(path)

export interface TaskUpdateRecord {
  task: Task
  reason: 'created' | 'modified' | 'removed'
}

export type TaskCallback = (t: TaskUpdateRecord[]) => void

const subs = new Map<string, Set<TaskCallback>>()

const sendUpdateTask = (projectId: string, tr: TaskUpdateRecord) => {
  subs.get(String(projectId))?.forEach(cb => cb([tr]))
}

export const subscribe = (projectId: string, cb: TaskCallback) => {
  projectId = String(projectId)
  const projectSubs = subs.get(projectId)

  if (projectSubs)
    projectSubs.add(cb)
  else
    subs.set(projectId, new Set<TaskCallback>().add(cb))
}

export const unsubscribe = (projectId: string, cb: TaskCallback) => {
  projectId = String(projectId)

  const projectSubs = subs.get(projectId)
  if (projectSubs) {
    projectSubs.delete(cb)
    if (!projectSubs.size)
      subs.delete(projectId)
  }
}

export const loadTasks = async (projectId: string) => {
  try {
    return await api.get<Task[]>(`/?projectId=${projectId}`)
  }
  catch (err: any) {
    throw handleError(err)
  }
}

export const createTask = async (_task: Task) => {
  let order: number
  try {
    const lastTask = await api.get<Task[]>('', { query: { _sort: 'order', _order: 'desc', _limit: 1 } })
    order = Number(lastTask[0].order) + 1000
  }
  catch (err) {
    const error = handleError(err)
    throw error.message
  }

  try {
    const createdAt = new Date().toJSON()
    const updatedAt = createdAt
    const task = await api.post<Task>({ ..._task, order, createdAt, updatedAt })
    sendUpdateTask(task.projectId, { task, reason: 'created' })
    return task
  }
  catch (err: any) {
    const error = handleError(err)
    throw error.message
  }
}

export const updateTask = async (_task: Task) => {
  try {
    const updatedAt = new Date().toJSON()
    const task = await api.put<Task>(_task.id, { ..._task, updatedAt })
    sendUpdateTask(task.projectId, { task, reason: 'modified' })
    return task
  }
  catch (err: any) {
    handleError(err)
  }
}

export const patchTask = async (id: string, data: any) => {
  try {
    const updatedAt = new Date().toJSON()
    const task = await api.patch<Task>(id, { ...data, updatedAt })
    sendUpdateTask(task.projectId, { task, reason: 'modified' })
    return task
  }
  catch (err: any) {
    handleError(err)
  }
}

export const deleteTask = async (task: Task) => {
  try {
    await api.delete(task.projectId)
    sendUpdateTask(task.projectId, { task, reason: 'removed' })

    return true
  }
  catch (err: any) {
    handleError(err)
  }
}
