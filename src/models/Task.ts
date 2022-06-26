export interface Task {
  id: string
  projectId: string
  ownwerId: string
  stage: string
  order: number
  createdAt: number
  tags: string[]
}
