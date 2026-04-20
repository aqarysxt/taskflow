import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { playStatusChange, playDelete, playComplete } from '../hooks/useSound';
import TaskModal from './TaskModal';
import './TasksPage.css';

const SORT_OPTIONS = [
  { value: 'newest', key: 'sortNewest' },
  { value: 'deadline', key: 'sortDeadline' },
  { value: 'priority', key: 'sortPriority' },
  { value: 'status', key: 'sortStatus' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const STATUS_ORDER = { pending: 0, in_progress: 1, completed: 2 };

export default function TasksPage() {
  const { t } = useTranslation();
  const { user, getUserById } = useAuth();
  const { getVisibleTasks, getVisibleProjects, updateTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const visibleTasks = getVisibleTasks(user?.id, user?.role);
  const visibleProjects = getVisibleProjects(user?.id, user?.role);

  const filteredTasks = useMemo(() => {
    let result = visibleTasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterProject !== 'all' && task.projectId !== filterProject) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const assigneeName = getUserById(task.assigneeId)?.name || '';
        return task.title.toLowerCase().includes(q) ||
               task.description?.toLowerCase().includes(q) ||
               assigneeName.toLowerCase().includes(q);
      }
      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'deadline': return new Date(a.deadline) - new Date(b.deadline);
        case 'priority': return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
        case 'status': return (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
        case 'newest':
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [visibleTasks, filterStatus, filterProject, filterPriority, searchQuery, sortBy, getUserById]);

  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };
  const openCreate = () => { setEditingTask(null); setModalOpen(true); };

  const handleDelete = (id) => {
    deleteTask(id);
    playDelete();
    setDeleteConfirmId(null);
  };

  const cycleStatus = (task) => {
    const order = ['pending', 'in_progress', 'completed'];
    const idx = order.indexOf(task.status);
    const next = order[(idx + 1) % order.length];
    updateTask(task.id, { status: next });
    if (next === 'completed') playComplete();
    else playStatusChange();
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { cls: 'badge-pending', label: t('tasks.pending') },
      in_progress: { cls: 'badge-in-progress', label: t('tasks.inProgress') },
      completed: { cls: 'badge-completed', label: t('tasks.completed') },
    };
    const { cls, label } = map[status] || map.pending;
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const map = {
      high: { cls: 'badge-high', label: t('tasks.high') },
      medium: { cls: 'badge-medium', label: t('tasks.medium') },
      low: { cls: 'badge-low', label: t('tasks.low') },
    };
    const { cls, label } = map[priority] || map.medium;
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const isOverdue = (task) => {
    if (task.status === 'completed') return false;
    return new Date(task.deadline) < new Date();
  };

  const getAssigneeName = (task) => {
    if (!task.assigneeId) return '';
    const u = getUserById(task.assigneeId);
    return u?.name || '';
  };

  return (
    <div className="tasks-page">
      {/* Toolbar */}
      <div className="tasks-toolbar animate-fadeInUp">
        <div className="tasks-toolbar-left">
          <div className="tasks-search-box">
            <span className="tasks-search-icon">⌕</span>
            <input
              type="text"
              className="input tasks-search-input"
              placeholder={t('tasks.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + {t('tasks.addTask')}
        </button>
      </div>

      {/* Filters + Sort */}
      <div className="tasks-filters animate-fadeInUp" style={{ animationDelay: '60ms' }}>
        <select className="input tasks-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">{t('tasks.allStatuses')}</option>
          <option value="pending">{t('tasks.pending')}</option>
          <option value="in_progress">{t('tasks.inProgress')}</option>
          <option value="completed">{t('tasks.completed')}</option>
        </select>
        <select className="input tasks-filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="all">{t('tasks.allProjects')}</option>
          {visibleProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input tasks-filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">{t('tasks.allPriorities')}</option>
          <option value="high">{t('tasks.high')}</option>
          <option value="medium">{t('tasks.medium')}</option>
          <option value="low">{t('tasks.low')}</option>
        </select>
        <select className="input tasks-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{t('tasks.sortBy')}: {t(`tasks.${opt.key}`)}</option>
          ))}
        </select>
        <span className="tasks-count text-sm">{filteredTasks.length} {t('tasks.title').toLowerCase()}</span>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{t('tasks.noTasks')}</h3>
          <p>{t('tasks.noTasksDesc')}</p>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 'var(--space-4)' }}>
            + {t('tasks.addTask')}
          </button>
        </div>
      ) : (
        <div className="tasks-list stagger-children">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`tasks-card glass-card ${isOverdue(task) ? 'tasks-card-overdue' : ''}`}>
              <div className="tasks-card-left">
                <button
                  className={`tasks-check ${task.status === 'completed' ? 'tasks-check-done' : ''}`}
                  onClick={() => cycleStatus(task)}
                  title="Change status"
                >
                  {task.status === 'completed' ? '✓' : '○'}
                </button>
                <div className="tasks-card-info">
                  <div className="tasks-card-title-row">
                    <span className={`tasks-card-title ${task.status === 'completed' ? 'tasks-card-completed' : ''}`}>
                      {task.title}
                    </span>
                    {task.isShared && <span className="badge badge-in-progress" style={{ fontSize: '0.55rem' }}>SHARED</span>}
                    {task.attachments?.length > 0 && <span style={{ fontSize: '0.7rem' }}>📎{task.attachments.length}</span>}
                    {isOverdue(task) && <span className="badge badge-high" style={{ fontSize: '0.6rem' }}>OVERDUE</span>}
                  </div>
                  <div className="tasks-card-meta text-xs">
                    <span style={{ color: visibleProjects.find(p => p.id === task.projectId)?.color || 'var(--text-tertiary)' }}>
                      ● {visibleProjects.find(p => p.id === task.projectId)?.name || '—'}
                    </span>
                    <span>📅 {task.deadline} {task.deadlineTime || ''}</span>
                    {getAssigneeName(task) && <span>👤 {getAssigneeName(task)}</span>}
                  </div>
                </div>
              </div>
              <div className="tasks-card-right">
                <div className="tasks-card-badges">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
                <div className="tasks-card-actions">
                  <button className="btn-ghost" onClick={() => openEdit(task)} title={t('common.edit')}>✎</button>
                  {deleteConfirmId === task.id ? (
                    <div className="tasks-delete-confirm">
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>
                        {t('common.delete')}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)}>
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button className="btn-ghost" onClick={() => setDeleteConfirmId(task.id)} title={t('common.delete')}>🗑</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
