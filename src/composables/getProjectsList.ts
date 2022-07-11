import { ref } from 'vue'
import { projectsListApi } from '~/api'
import type { Project } from '~/models/Project'

export const getProjectsList = () => {
  const projects = ref<Project[]>([])
  const isPending = ref(true)
  const error = ref<any>(null)

  // TODO subscription to projects
  const onChange = (pl: { project: Project; reason: string }[]) => {
    if (pl.length === 0)
      return
    const p = [...projects.value]
    pl.forEach(({ project, reason }) => {
      const i = p.findIndex(item => item.id === project.id)
      if (i < 0)
        return

      if (reason === 'deleted')
        p.splice(i, 1)

      else if (reason === 'created')
        p.push(project)

      else if (reason === 'changed')
        p.splice(i, 1, project)
    })

    projects.value = p
  }

  const onError = (err: any) => {
    error.value = err
  }

  projectsListApi.subscribe(onChange, onError)

  isPending.value = true
  projectsListApi.load()
    .then((p: Project[]) => projects.value = p)
    .catch((err: any) => error.value = err)
    .finally(() => isPending.value = false)

  return {
    projects,
    isPending,
    error,
  }
}
