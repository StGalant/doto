import { defaults } from 'mande'

export * from './auth'
export * from './currentProjectsList'
export * from './project'
export * as tasks from './tasks'

defaults.headers['Cache-control'] = 'no-cache'
