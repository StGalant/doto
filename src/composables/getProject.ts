import { ref } from 'vue'
import { projectApi } from '~/api'
import type { Project } from '~/models/Project'

const { useProject } = projectApi

export function getProject(id: string) {
  const project = ref<null | Project>(null)
  const error = ref<null | string>(null)

  const api = useProject(id, (p, _change) => {
    project.value = p
  }, (err) => {
    error.value = err
  })

  const isPending = ref(true)
  error.value = null
  api.load()
    .catch((_err) => {}) // error handle by callback
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

  return { project, error, isPending, save }
}
