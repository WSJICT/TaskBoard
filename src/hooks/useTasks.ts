import { useCallback, useEffect, useRef, useState } from 'react'
import { SEED_TASKS, STORAGE_KEY } from '../constants'
import type { Status, Task, TaskDraft } from '../types'

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.priority === 'string' &&
    Array.isArray(task.tags) &&
    typeof task.createdAt === 'number' &&
    (task.dueDate === null || typeof task.dueDate === 'string') &&
    ['backlog', 'active', 'review', 'done'].includes(String(task.status))
  )
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_TASKS
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isTask)) return SEED_TASKS
    return parsed
  } catch {
    return SEED_TASKS
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      } catch {
        /* 存储空间不可用时静默降级 */
      }
    }, 200)
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    }
  }, [tasks])

  const addTask = useCallback((draft: TaskDraft) => {
    const task: Task = {
      ...draft,
      id: makeId(),
      createdAt: Date.now(),
    }
    setTasks((prev) => [task, ...prev])
    return task
  }, [])

  const updateTask = useCallback((id: string, draft: TaskDraft) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...draft } : task)),
    )
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const moveTask = useCallback(
    (id: string, status: Status, beforeId: string | null) => {
      setTasks((prev) => {
        const index = prev.findIndex((task) => task.id === id)
        if (index === -1) return prev
        const next = prev.slice()
        const [moving] = next.splice(index, 1)
        const updated: Task = { ...moving, status }

        if (beforeId && beforeId !== id) {
          const target = next.findIndex((task) => task.id === beforeId)
          if (target !== -1) {
            next.splice(target, 0, updated)
            return next
          }
        }

        let lastIndex = -1
        next.forEach((task, i) => {
          if (task.status === status) lastIndex = i
        })
        next.splice(lastIndex + 1, 0, updated)
        return next
      })
    },
    [],
  )

  const resetBoard = useCallback(() => {
    setTasks(SEED_TASKS)
  }, [])

  return { tasks, addTask, updateTask, removeTask, moveTask, resetBoard }
}