import { PRIORITIES, formatDueDate, isOverdue } from '../constants'
import type { Task } from '../types'
import { CalendarIcon, EditIcon, GripIcon, TrashIcon } from './Icons'

interface TaskCardProps {
  task: Task
  isDragging: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDropBefore: (beforeId: string) => void
}

export function TaskCard({
  task,
  isDragging,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropBefore,
}: TaskCardProps) {
  const priority = PRIORITIES[task.priority]
  const overdue = isOverdue(task)

  return (
    <article
      className={`task-card${isDragging ? ' task-card--dragging' : ''}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', task.id)
        onDragStart(task)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDropBefore(task.id)
      }}
    >
      <div className="task-card__glow" aria-hidden="true" />
      <div className="task-card__top">
        <span
          className="priority-chip"
          style={{ ['--chip-color' as string]: priority.color }}
        >
          <span className="priority-chip__dot" />
          {priority.code}
          <span className="priority-chip__label">{priority.label}</span>
        </span>
        <span className="task-card__tools">
          <button
            type="button"
            className="icon-button"
            aria-label={`编辑任务：${task.title}`}
            title="编辑"
            onClick={() => onEdit(task)}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            aria-label={`删除任务：${task.title}`}
            title="删除"
            onClick={() => onDelete(task.id)}
          >
            <TrashIcon />
          </button>
          <span className="task-card__grip" title="拖动排序">
            <GripIcon />
          </span>
        </span>
      </div>

      <h3 className="task-card__title">{task.title}</h3>
      {task.description ? (
        <p className="task-card__description">{task.description}</p>
      ) : null}

      {task.tags.length > 0 ? (
        <div className="task-card__tags">
          {task.tags.slice(0, 3).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
          {task.tags.length > 3 ? (
            <span className="tag tag--more">+{task.tags.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      <footer className="task-card__footer">
        {task.dueDate ? (
          <span className={`due-date${overdue ? ' due-date--overdue' : ''}`}>
            <CalendarIcon width={13} height={13} />
            {formatDueDate(task.dueDate)}
            {overdue ? <em>逾期</em> : null}
          </span>
        ) : (
          <span className="due-date due-date--empty">未设置截止时间</span>
        )}
      </footer>
    </article>
  )
}