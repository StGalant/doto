import { mande } from 'mande'
import config from './config'
import handleError from './handleError'
import type { Task } from '~/models/Task'

const { collections: { tasks: { path } } } = config
const api = mande(path)

export const loadTasks = async (id: string) => {
  try {
    return await api.get<Task[]>(`/?projectId=${id}`)
  }
  catch (err: any) {
    handleError(err)
  }
}

export const createTask = async (task: Task) => {
  try {
    await api.post(task)
    return task
  }
  catch (err: any) {
    handleError(err)
  }
}

export const updateTask = async (task: Task) => {
  try {
    await api.put(task.id, task)
    return task
  }
  catch (err: any) {
    handleError(err)
  }
}

export const patchTask = async (id: string, data: any) => {
  try {
    await api.patch(id, data)
    return true
  }
  catch (err: any) {
    handleError(err)
  }
}

export const deleteTask = async (id: string) => {
  try {
    await api.delete(id)
    return true
  }
  catch (err: any) {
    handleError(err)
  }
}
