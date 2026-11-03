export type Status = 'backlog' | 'active' | 'review' | 'done'

export type Priority = 'urgent' | 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  tags: string[]
  dueDate: string | null
  status: Status
  createdAt: number
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt'>

export type PriorityFilter = Priority | 'all'

export interface ColumnMeta {
  id: Status
  label: string
  hint: string
  accent: string
}