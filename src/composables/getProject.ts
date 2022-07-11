import { onUnmounted, ref } from 'vue'
import { projectApi } from '~/api'
import type { Project } from '~/models/Project'

const { useProject } = projectApi

export function getProject(id: string) {
  const project = ref<null | Project>(null)
  const error = ref<null | string>(null)

  const onChange = (p: Project, _change: any) => {
    project.value = p
  }

  const onError = (err: any) => {
    error.value = err
  }

  const api = useProject(id)
  api.subscribe(onChange, onError)

  const isPending = ref(true)
  error.value = null
  api.load()
    .catch((_err) => {}) // error handled by callback
    .finally(() => {
      isPending.value = false
    })

  const save = () => {
    if (!project.value)
      return
    isPending.value = true
    error.value = null
    api.update(project.value)
      .catch((_err) => {})
      .finally(() => {
        isPending.value = false
      })
  }

  onUnmounted(() => api.unsubscribe(onChange, onError))

  return { project, error, isPending, save }
}
