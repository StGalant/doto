import { onUnmounted, ref } from 'vue'
import { tasksApi } from '~/api'
import type { Task } from '~/models/Task'

const { loadTasks, subscribe, unsubscribe } = tasksApi
export const getTasks = (projectId: string) => {
  const tasks = ref<Task[]>([])
  const isPending = ref(true)
  const error = ref<any>(null)

  const tasksUpdated = (ts: any[]) => {
    ts.forEach(({ task, reason }) => {
      if (reason === 'created') {
        tasks.value.push(task)
      }
      else if (reason === 'removed') {
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index >= 0)
          tasks.value.splice(index, 1)
      }
      else if (reason === 'modified') {
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index >= 0)
          tasks.value.splice(index, 1, task)
      }
    })
  }

  onUnmounted(() => unsubscribe(projectId, tasksUpdated))

  loadTasks(projectId)
    .then((_tasks) => {
      tasks.value = _tasks
      subscribe(projectId, tasksUpdated)
    })
    .catch((err: any) => { error.value = err.message })
    .finally(() => isPending.value = false)
  return {
    tasks,
    isPending,
    error,
  }
}
