import { defaults } from 'mande'

export * as authApi from './auth'
export * as projectsListApi from './currentProjectsList'
export * as projectApi from './project'
export * as tasksApi from './tasks'

defaults.headers['Cache-control'] = 'no-cache'
