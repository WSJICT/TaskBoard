import { useCallback, useEffect, useMemo, useState } from 'react'
import { Board } from './components/Board'
import { BoltIcon, LayersIcon, PlusIcon, SearchIcon } from './components/Icons'
import { TaskModal } from './components/TaskModal'
import { PRIORITIES, PRIORITY_ORDER } from './constants'
import { useTasks } from './hooks/useTasks'
import type { PriorityFilter, Status, Task, TaskDraft } from './types'

interface EditorState {
  task: Task | null
  status: Status
}

function App() {
  const { tasks, addTask, updateTask, removeTask, moveTask, resetBoard } = useTasks()
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [editor, setEditor] = useState<EditorState | null>(null)

  const visibleTasks = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesKeyword =
        !keyword ||
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword) ||
        task.tags.some((tag) => tag.toLowerCase().includes(keyword))
      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter
      return matchesKeyword && matchesPriority
    })
  }, [tasks, query, priorityFilter])

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((task) => task.status === 'done').length
    const working = tasks.filter(
      (task) => task.status === 'active' || task.status === 'review',
    ).length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdue = tasks.filter(
      (task) =>
        task.status !== 'done' &&
        task.dueDate !== null &&
        new Date(`${task.dueDate}T00:00:00`) < today,
    ).length
    const completion = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, working, overdue, completion }
  }, [tasks])

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    [],
  )

  const openCreate = useCallback((status: Status = 'backlog') => {
    setEditor({ task: null, status })
  }, [])

  const openEdit = useCallback((task: Task) => {
    setEditor({ task, status: task.status })
  }, [])

  const closeEditor = useCallback(() => setEditor(null), [])

  const handleSubmit = useCallback(
    (draft: TaskDraft) => {
      if (!editor) return
      if (editor.task) {
        updateTask(editor.task.id, draft)
      } else {
        addTask(draft)
      }
      setEditor(null)
    },
    [editor, updateTask, addTask],
  )

  const handleDelete = useCallback(
    (id: string) => {
      const target = tasks.find((task) => task.id === id)
      if (!target) return
      if (window.confirm(`确定删除「${target.title}」吗？此操作不可撤销。`)) {
        removeTask(id)
      }
    },
    [tasks, removeTask],
  )

  const handleReset = useCallback(() => {
    if (window.confirm('将恢复为初始示例任务，当前看板内容会被覆盖。是否继续？')) {
      resetBoard()
    }
  }, [resetBoard])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.toLowerCase() !== 'n') return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      event.preventDefault()
      setEditor({ task: null, status: 'backlog' })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="app">
      <div className="ambient" aria-hidden="true">
        <span className="ambient__orb ambient__orb--indigo" />
        <span className="ambient__orb ambient__orb--violet" />
        <span className="ambient__grid" />
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">
            <LayersIcon width={18} height={18} />
          </span>
          <span className="brand__text">
            <strong>Flowline</strong>
            <small>任务看板</small>
          </span>
        </div>

        <div className="topbar__right">
          <label className="search">
            <SearchIcon className="search__icon" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索任务、描述或标签…"
              aria-label="搜索任务"
            />
            <kbd>/</kbd>
          </label>
          <button
            type="button"
            className="primary-button"
            onClick={() => openCreate('backlog')}
          >
            <PlusIcon width={15} height={15} />
            新建任务
            <kbd>N</kbd>
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__pulse" />
              WORKSPACE · Q4 ROADMAP
            </p>
            <h1>
              把复杂项目，
              <br />
              <span className="hero__accent">拆成清晰的下一步。</span>
            </h1>
            <p className="hero__sub">
              {todayLabel} · 拖动卡片推进任务，所有改动自动保存在本地。
            </p>
          </div>

          <div className="stats">
            <article className="stat">
              <span className="stat__label">全部任务</span>
              <strong className="stat__value">{stats.total}</strong>
              <span className="stat__meta">共 {stats.total} 张卡片</span>
            </article>
            <article className="stat">
              <span className="stat__label">进行中</span>
              <strong className="stat__value">{stats.working}</strong>
              <span className="stat__meta">
                <BoltIcon width={12} height={12} /> 含待验收任务
              </span>
            </article>
            <article className="stat stat--alert">
              <span className="stat__label">已逾期</span>
              <strong className="stat__value">{stats.overdue}</strong>
              <span className="stat__meta">需要尽快处理</span>
            </article>
            <article
              className="stat stat--progress"
              style={{ ['--progress' as string]: `${stats.completion}%` }}
            >
              <span className="stat__label">完成率</span>
              <strong className="stat__value">{stats.completion}%</strong>
              <span className="stat__meta">{stats.done} 个任务已完成</span>
            </article>
          </div>
        </section>

        <section className="toolbar" aria-label="筛选条件">
          <div className="filter-group">
            <button
              type="button"
              className={`filter-pill${priorityFilter === 'all' ? ' filter-pill--active' : ''}`}
              onClick={() => setPriorityFilter('all')}
            >
              全部优先级
            </button>
            {PRIORITY_ORDER.map((priority) => (
              <button
                key={priority}
                type="button"
                className={`filter-pill${priorityFilter === priority ? ' filter-pill--active' : ''}`}
                style={{ ['--pill-color' as string]: PRIORITIES[priority].color }}
                onClick={() => setPriorityFilter(priority)}
              >
                <span className="filter-pill__dot" />
                {PRIORITIES[priority].label}
              </button>
            ))}
          </div>
          <div className="toolbar__meta">
            <span>
              显示 <strong>{visibleTasks.length}</strong> / {tasks.length} 个任务
            </span>
            <button type="button" className="text-button" onClick={handleReset}>
              恢复示例
            </button>
          </div>
        </section>

        <Board
          tasks={visibleTasks}
          onMove={moveTask}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {visibleTasks.length === 0 ? (
          <div className="board-empty">
            <p>没有匹配的任务</p>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setQuery('')
                setPriorityFilter('all')
              }}
            >
              清除筛选条件
            </button>
          </div>
        ) : null}

        <footer className="app-footer">
          <span className="app-footer__status">
            <span className="status-dot" />
            本地自动保存已开启
          </span>
          <span>拖动卡片可在列间移动 · 按 N 新建任务</span>
        </footer>
      </main>

      {editor ? (
        <TaskModal
          key={editor.task?.id ?? `new-${editor.status}`}
          task={editor.task}
          defaultStatus={editor.status}
          onClose={closeEditor}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}

export default App