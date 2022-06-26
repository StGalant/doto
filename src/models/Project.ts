export interface Project {
  id: string
  title: string
  content: string
  ownerId: string
  membersIds: string[]
  stages: string[]
  active: boolean
  tags: string[]
  createdAt: number
  updatedAt: number
}

export const defaultStages = [
  'STORY',
  'TODO',
  'DONE',
]
