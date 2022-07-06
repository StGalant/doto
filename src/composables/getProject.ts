import { ref } from 'vue'
import { useProject } from '~/api'
import type { Project } from '~/models/Project'

export function getProject(id: string) {
  const project = ref<null | Project>(null)
  const error = ref<null | string>(null)

  const api = useProject(id, (p, _change) => {
    project.value = p
  }, (err) => { error.value = err.message })

  const isPending = ref(true)
  api.load()
    .catch() // error handle by callback
    .finally(() => isPending.value = false)

  const save = () => {
    if (!project.value)
      return
    isPending.value = true
    api.update(project.value)
      .catch()
      .finally(() => isPending.value = false)
  }

  return { project, error, isPending, save }
}
