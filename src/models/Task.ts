export interface Task {
  id: string
  projectId: string
  ownwerId: string
  stageId: string
  order: number
  createdAt: string
  updatedAt: string
  tags: string[]
  content: string
}
