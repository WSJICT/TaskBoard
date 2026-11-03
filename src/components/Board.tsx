import { useState } from 'react'
import { COLUMNS } from '../constants'
import type { Status, Task } from '../types'
import { Column } from './Column'

interface BoardProps {
  tasks: Task[]
  onMove: (id: string, status: Status, beforeId: string | null) => void
  onCreate: (status: Status) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function Board({ tasks, onMove, onCreate, onEdit, onDelete }: BoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <div className="board" role="list" aria-label="任务看板">
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.status === column.id)}
          draggingId={draggingId}
          onMove={onMove}
          onCreate={onCreate}
          onEdit={onEdit}
          onDelete={onDelete}
          onDragStart={(task) => setDraggingId(task.id)}
          onDragEnd={() => setDraggingId(null)}
        />
      ))}
    </div>
  )
}