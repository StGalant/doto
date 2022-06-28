export interface Stage {
  id: string
  name?: string
  color?: string
}

export interface Project {
  id: string
  title: string
  content: string
  ownerId: string
  membersIds: string[]
  stages: Stage[]
  active: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const defaultStages = [
  'STORY',
  'TODO',
  'DONE',
]

export const createProject = () => {
  return {
    title: '',
    content: '',
    tags: [],
    stages: [...defaultStages],
    active: true,
  }
}
