export interface Stage {
  id: string
  name?: string
  color?: string
  final?: boolean
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

export const defaultStages: Stage[] = [
  {
    id: 'IDEA',
    name: 'Задумки',
  },
  {
    id: 'INPROGRESS',
    name: 'В работе',
  },
  {
    id: 'DONE',
    name: 'Завершено',
    final: true,
  },
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
