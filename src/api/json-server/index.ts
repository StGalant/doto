import { defaults } from 'mande'

export * from './auth'
export * from './currentProjectsList'
export * from './project'

defaults.headers['Cache-control'] = 'no-cache'
