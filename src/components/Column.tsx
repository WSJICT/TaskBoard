import { useState } from 'react'
import type { ColumnMeta, Status, Task } from '../types'
import { PlusIcon } from './Icons'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnMeta
  tasks: Task[]
  draggingId: string | null
  onMove: (id: string, status: Status, beforeId: string | null) => void
  onCreate: (status: Status) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
}

export function Column({
  column,
  tasks,
  draggingId,
  onMove,
  onCreate,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: ColumnProps) {
  const [isTarget, setIsTarget] = useState(false)

  return (
    <section
      className={`column${isTarget ? ' column--target' : ''}`}
      style={{ ['--column-accent' as string]: column.accent }}
      aria-label={`${column.label}列`}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setIsTarget(true)
      }}
      onDragLeave={(event) => {
        const next = event.relatedTarget as Node | null
        if (!next || !event.currentTarget.contains(next)) setIsTarget(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsTarget(false)
        const id = event.dataTransfer.getData('text/plain')
        if (id) onMove(id, column.id, null)
      }}
    >
      <header className="column__header">
        <div className="column__heading">
          <span className="column__dot" aria-hidden="true" />
          <h2 className="column__title">{column.label}</h2>
          <span className="column__count">{tasks.length}</span>
        </div>
        <button
          type="button"
          className="icon-button column__add"
          aria-label={`在${column.label}列新建任务`}
          title="新建任务"
          onClick={() => onCreate(column.id)}
        >
          <PlusIcon />
        </button>
        <span className="column__hint">{column.hint}</span>
      </header>

      <div className="column__body">
        {tasks.length === 0 ? (
          <div className="column__empty">
            <span className="column__empty-mark" aria-hidden="true" />
            拖拽任务到此处
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={draggingId === task.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDropBefore={(beforeId) => onMove(task.id, column.id, beforeId)}
            />
          ))
        )}
      </div>

      <button
        type="button"
        className="column__footer"
        onClick={() => onCreate(column.id)}
      >
        <PlusIcon width={14} height={14} />
        新建任务
      </button>
    </section>
  )
}