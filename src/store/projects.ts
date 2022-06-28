import { acceptHMRUpdate, defineStore } from 'pinia'
import { useUserStore } from './user'
import { loadCurrentProjects } from '~/api'
import type { Project } from '~/models/Project'

interface ProjectsStore {
  projects: Project[]
  loading: boolean
  updating: boolean
  error: string | null
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsStore => {
    return {
      projects: [],
      loading: true,
      updating: true,
      error: null,
    }
  },
  getters: {
    getProject: (state) => {
      return (id: string) => state.projects.find(project => project.id === id)
    },
  },
  actions: {
    updateProjects(newProjects: Project[]) {
      this.projects = newProjects
      this.loading = false
      this.updating = false
      this.error = null
    },
    setError(err: any) {
      this.error = err.message
      this.loading = false
      this.updating = false
    },
    loadProjects() {
      this.loading = true
      loadCurrentProjects(this.updateProjects, this.setError)
    },
    async addProject(p: Project) {
      // TODO call API
      const userStore = useUserStore()
      if (!userStore.user)
        throw new Error('Authorisation failed')

      p.ownerId = userStore.user.id
      console.log(this.projects)
      console.log(p)

      this.projects.push(p)
      console.log(this.projects)

      return p
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useProjectsStore, import.meta.hot))
