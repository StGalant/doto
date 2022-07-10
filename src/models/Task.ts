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
  color?: string
}

export const newTask = (projectId: string): Task => ({
  id: '',
  projectId,
  ownwerId: '',
  stageId: '',
  order: -1,
  createdAt: '',
  updatedAt: '',
  tags: [],
  content: '',
})
