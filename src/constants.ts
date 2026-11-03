import type { ColumnMeta, Priority, Task } from './types'

export const COLUMNS: ColumnMeta[] = [
  { id: 'backlog', label: '待办', hint: 'BACKLOG', accent: '#8A8F98' },
  { id: 'active', label: '进行中', hint: 'IN PROGRESS', accent: '#6366F1' },
  { id: 'review', label: '待验收', hint: 'IN REVIEW', accent: '#A855F7' },
  { id: 'done', label: '已完成', hint: 'DONE', accent: '#34D399' },
]

export const PRIORITIES: Record<
  Priority,
  { label: string; code: string; color: string }
> = {
  urgent: { label: '紧急', code: 'P0', color: '#F87171' },
  high: { label: '高', code: 'P1', color: '#FBBF24' },
  medium: { label: '中', code: 'P2', color: '#818CF8' },
  low: { label: '低', code: 'P3', color: '#71717A' },
}

export const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low']

export const STORAGE_KEY = 'flowline.board.v1'

export const SEED_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: '梳理 Q4 产品路线图',
    description: '对齐设计、研发与运营三方目标，输出里程碑清单与负责人。',
    priority: 'urgent',
    tags: ['规划', '产品'],
    dueDate: offsetDate(3),
    status: 'active',
    createdAt: Date.now() - 86_400_000 * 3,
  },
  {
    id: 'seed-2',
    title: '看板拖拽交互联调',
    description: '验证跨列拖拽、排序插入与移动端触摸体验的一致性。',
    priority: 'high',
    tags: ['前端', '交互'],
    dueDate: offsetDate(1),
    status: 'active',
    createdAt: Date.now() - 86_400_000 * 2,
  },
  {
    id: 'seed-3',
    title: '设计系统色板校准',
    description: '统一深色模式下的描边、光照与强调色使用规范。',
    priority: 'medium',
    tags: ['设计'],
    dueDate: offsetDate(6),
    status: 'backlog',
    createdAt: Date.now() - 86_400_000,
  },
  {
    id: 'seed-4',
    title: '性能基线测试',
    description: '采集首屏渲染与交互帧率数据，形成可对比的基线报告。',
    priority: 'medium',
    tags: ['性能'],
    dueDate: null,
    status: 'backlog',
    createdAt: Date.now() - 86_400_000,
  },
  {
    id: 'seed-5',
    title: '空状态与加载骨架',
    description: '为新用户提供示例数据引导，补充 shimmer 骨架屏。',
    priority: 'low',
    tags: ['体验'],
    dueDate: offsetDate(10),
    status: 'backlog',
    createdAt: Date.now() - 3_600_000,
  },
  {
    id: 'seed-6',
    title: '任务数据本地持久化',
    description: '离开页面后任务保留，包含版本迁移与损坏数据兜底。',
    priority: 'high',
    tags: ['前端', '存储'],
    dueDate: offsetDate(2),
    status: 'review',
    createdAt: Date.now() - 86_400_000 * 4,
  },
  {
    id: 'seed-7',
    title: '确立品牌字阶与间距',
    description: '建立 4pt 间距体系，明确标题、正文与辅助文本的字号层级。',
    priority: 'low',
    tags: ['设计', '规范'],
    dueDate: null,
    status: 'done',
    createdAt: Date.now() - 86_400_000 * 6,
  },
]

function offsetDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${task.dueDate}T00:00:00`) < today
}

export function formatDueDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}