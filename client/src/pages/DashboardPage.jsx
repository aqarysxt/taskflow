import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import './DashboardPage.css';

function AnimatedCounter({ end, duration = 1200 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span className="dashboard-stat-number">{count}</span>;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, getUserById } = useAuth();
  const { getVisibleTasks, getVisibleProjects, getStats, tasks } = useTasks();

  const visibleTasks = getVisibleTasks(user?.id, user?.role);
  const visibleProjects = getVisibleProjects(user?.id, user?.role);
  const stats = getStats(user?.id, user?.role);

  const recentTasks = [...visibleTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

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

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    { key: 'total', label: t('dashboard.totalTasks'), value: stats.total, color: 'var(--primary-500)', icon: '☰' },
    { key: 'completed', label: t('dashboard.completed'), value: stats.completed, color: 'var(--success-500)', icon: '✓' },
    { key: 'inProgress', label: t('dashboard.inProgress'), value: stats.inProgress, color: 'var(--info-500)', icon: '↻' },
    { key: 'pending', label: t('dashboard.pending'), value: stats.pending, color: 'var(--warning-500)', icon: '◷' },
  ];

  const getAssigneeName = (task) => {
    if (!task.assigneeId) return '—';
    const u = getUserById(task.assigneeId);
    return u?.name || task.assigneeId;
  };

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="dashboard-welcome animate-fadeInUp">
        <div>
          <h2>{t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {stats.overdue > 0
              ? `${stats.overdue} ${t('dashboard.overdue').toLowerCase()} — ${stats.inProgress} ${t('dashboard.inProgress').toLowerCase()}`
              : `${stats.inProgress} ${t('dashboard.inProgress').toLowerCase()} — ${stats.pending} ${t('dashboard.pending').toLowerCase()}`
            }
          </p>
        </div>
        <Link to="/tasks" className="btn btn-primary">
          + {t('dashboard.addTask')}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats stagger-children">
        {statCards.map(card => (
          <div key={card.key} className="glass-card dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{card.label}</span>
              <AnimatedCounter end={card.value} />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="glass-card dashboard-recent animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="dashboard-section-header">
            <h3>{t('dashboard.recentTasks')}</h3>
            <Link to="/tasks" className="btn btn-ghost text-sm">{t('dashboard.viewAll')} →</Link>
          </div>
          <div className="dashboard-task-list">
            {recentTasks.map((task, i) => (
              <div key={task.id} className="dashboard-task-item" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
                <div className="dashboard-task-info">
                  <span className="dashboard-task-title">
                    {task.title}
                    {task.isShared && <span className="badge badge-in-progress" style={{ fontSize: '0.55rem', marginLeft: '6px' }}>SHARED</span>}
                    {task.attachments?.length > 0 && <span style={{ marginLeft: '4px', fontSize: '0.7rem' }}>📎</span>}
                  </span>
                  <span className="dashboard-task-meta text-xs">
                    {visibleProjects.find(p => p.id === task.projectId)?.name || '—'} · {task.deadline} {task.deadlineTime || ''} · {getAssigneeName(task)}
                  </span>
                </div>
                <div className="dashboard-task-badges">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Progress */}
        <div className="glass-card dashboard-progress animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="dashboard-section-header">
            <h3>{t('dashboard.projectProgress')}</h3>
          </div>
          <div className="dashboard-project-list">
            {visibleProjects.map((project) => {
              const projectTasks = visibleTasks.filter(t => t.projectId === project.id);
              const done = projectTasks.filter(t => t.status === 'completed').length;
              const total = projectTasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={project.id} className="dashboard-project-item">
                  <div className="dashboard-project-header">
                    <div className="flex items-center gap-2">
                      <span className="sidebar-project-dot" style={{ background: project.color }} />
                      <span className="text-sm" style={{ fontWeight: 500 }}>{project.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{done}/{total}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Rate Circle */}
          <div className="dashboard-completion">
            <div className="dashboard-completion-ring">
              <svg viewBox="0 0 120 120" className="dashboard-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-glass)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="var(--primary-500)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${completionRate * 3.14} 314`}
                  transform="rotate(-90 60 60)"
                  className="dashboard-ring-progress"
                />
              </svg>
              <span className="dashboard-ring-text">{completionRate}%</span>
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('reports.completionRate')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
