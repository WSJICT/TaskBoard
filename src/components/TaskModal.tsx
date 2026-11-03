import { useEffect, useRef, useState } from 'react'
import { COLUMNS, PRIORITIES, PRIORITY_ORDER } from '../constants'
import type { Priority, Status, Task, TaskDraft } from '../types'
import { CloseIcon } from './Icons'

interface TaskModalProps {
  task: Task | null
  defaultStatus: Status
  onClose: () => void
  onSubmit: (draft: TaskDraft) => void
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>()
  for (const part of raw.split(/[,，;；\s]+/)) {
    const tag = part.trim().slice(0, 12)
    if (tag) seen.add(tag)
    if (seen.size >= 5) break
  }
  return [...seen]
}

export function TaskModal({ task, defaultStatus, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus)
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [tagInput, setTagInput] = useState(task?.tags.join('，') ?? '')
  const [error, setError] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('任务标题不能为空')
      titleRef.current?.focus()
      return
    }
    onSubmit({
      title: trimmed.slice(0, 80),
      description: description.trim().slice(0, 400),
      priority,
      status,
      dueDate: dueDate || null,
      tags: parseTags(tagInput),
    })
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal__glow" aria-hidden="true" />
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">{task ? 'EDIT TASK' : 'NEW TASK'}</p>
            <h2 id="modal-title">{task ? '编辑任务' : '新建任务'}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="关闭弹窗"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <form className="modal__form" onSubmit={submit}>
          <label className="field">
            <span className="field__label">标题</span>
            <input
              ref={titleRef}
              type="text"
              value={title}
              maxLength={80}
              placeholder="例如：完成首页性能优化"
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              aria-invalid={error ? 'true' : 'false'}
            />
            {error ? <span className="field__error">{error}</span> : null}
          </label>

          <label className="field">
            <span className="field__label">描述</span>
            <textarea
              value={description}
              rows={3}
              maxLength={400}
              placeholder="补充背景、验收标准或相关链接…"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <div className="field">
            <span className="field__label">优先级</span>
            <div className="option-row">
              {PRIORITY_ORDER.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`option${priority === value ? ' option--active' : ''}`}
                  style={{ ['--option-color' as string]: PRIORITIES[value].color }}
                  onClick={() => setPriority(value)}
                >
                  <span className="option__dot" />
                  {PRIORITIES[value].label}
                  <small>{PRIORITIES[value].code}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">状态</span>
            <div className="option-row">
              {COLUMNS.map((column) => (
                <button
                  key={column.id}
                  type="button"
                  className={`option${status === column.id ? ' option--active' : ''}`}
                  style={{ ['--option-color' as string]: column.accent }}
                  onClick={() => setStatus(column.id)}
                >
                  <span className="option__dot" />
                  {column.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-row">
            <label className="field">
              <span className="field__label">截止日期</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">标签</span>
              <input
                type="text"
                value={tagInput}
                placeholder="用逗号或空格分隔，最多 5 个"
                onChange={(event) => setTagInput(event.target.value)}
              />
            </label>
          </div>

          <footer className="modal__actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="primary-button primary-button--wide">
              {task ? '保存修改' : '创建任务'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}