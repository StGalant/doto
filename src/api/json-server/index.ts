import { defaults } from 'mande'

export * as authApi from './auth'
export * as projectsListApi from './projectsList'
export * as projectApi from './project'
export * as tasksApi from './tasks'

defaults.cache = 'no-cache'
