import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import './ReportsPage.css';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { user, getUserById } = useAuth();
  const { getVisibleTasks, getVisibleProjects, getStats } = useTasks();

  const visibleTasks = getVisibleTasks(user?.id, user?.role);
  const visibleProjects = getVisibleProjects(user?.id, user?.role);
  const stats = getStats(user?.id, user?.role);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;

  const statusData = [
    { label: t('tasks.completed'), value: stats.completed, color: 'var(--success-400)', pct: stats.total > 0 ? (stats.completed / stats.total * 100) : 0 },
    { label: t('tasks.inProgress'), value: stats.inProgress, color: 'var(--primary-400)', pct: stats.total > 0 ? (stats.inProgress / stats.total * 100) : 0 },
    { label: t('tasks.pending'), value: stats.pending, color: 'var(--warning-400)', pct: stats.total > 0 ? (stats.pending / stats.total * 100) : 0 },
  ];

  const priorityData = useMemo(() => {
    const high = visibleTasks.filter(t => t.priority === 'high').length;
    const medium = visibleTasks.filter(t => t.priority === 'medium').length;
    const low = visibleTasks.filter(t => t.priority === 'low').length;
    const total = visibleTasks.length || 1;
    return [
      { label: t('tasks.high'), value: high, color: 'var(--danger-400)', pct: (high / total) * 100 },
      { label: t('tasks.medium'), value: medium, color: 'var(--warning-400)', pct: (medium / total) * 100 },
      { label: t('tasks.low'), value: low, color: 'var(--success-400)', pct: (low / total) * 100 },
    ];
  }, [visibleTasks, t]);

  const projectData = useMemo(() => {
    return visibleProjects.map(project => {
      const projectTasks = visibleTasks.filter(tk => tk.projectId === project.id);
      const completed = projectTasks.filter(tk => tk.status === 'completed').length;
      return {
        name: project.name,
        color: project.color,
        total: projectTasks.length,
        completed,
        pct: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0,
      };
    });
  }, [visibleTasks, visibleProjects]);

  const assigneeData = useMemo(() => {
    const map = {};
    visibleTasks.forEach(task => {
      const assignee = getUserById(task.assigneeId);
      const name = assignee?.name || 'Unassigned';
      if (!map[name]) map[name] = { total: 0, completed: 0 };
      map[name].total++;
      if (task.status === 'completed') map[name].completed++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      pct: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [visibleTasks, getUserById]);

  return (
    <div className="reports-page">
      <div className="reports-kpi stagger-children">
        <div className="glass-card reports-kpi-card">
          <span className="reports-kpi-label">{t('reports.completionRate')}</span>
          <span className="reports-kpi-value" style={{ color: 'var(--success-400)' }}>{completionRate}%</span>
          <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
            <div className="progress-bar-fill" style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, var(--success-500), var(--success-400))' }} />
          </div>
        </div>
        <div className="glass-card reports-kpi-card">
          <span className="reports-kpi-label">{t('reports.overdueRate')}</span>
          <span className="reports-kpi-value" style={{ color: 'var(--danger-400)' }}>{overdueRate}%</span>
          <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
            <div className="progress-bar-fill" style={{ width: `${overdueRate}%`, background: 'linear-gradient(90deg, var(--danger-500), var(--danger-400))' }} />
          </div>
        </div>
        <div className="glass-card reports-kpi-card">
          <span className="reports-kpi-label">{t('reports.totalCompleted')}</span>
          <span className="reports-kpi-value" style={{ color: 'var(--primary-400)' }}>{stats.completed}</span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/ {stats.total} {t('dashboard.totalTasks').toLowerCase()}</span>
        </div>
      </div>

      <div className="reports-grid">
        <div className="glass-card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{t('reports.tasksByStatus')}</h3>
          <div className="reports-bar-chart">
            {statusData.map((item, i) => (
              <div key={i} className="reports-bar-row">
                <span className="reports-bar-label text-sm">{item.label}</span>
                <div className="reports-bar-track">
                  <div className="reports-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <span className="reports-bar-value text-sm">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="reports-donut-container">
            <svg viewBox="0 0 200 200" className="reports-donut">
              {statusData.reduce((acc, item, i) => {
                const offset = acc.offset;
                const dash = (item.pct / 100) * 283;
                acc.elements.push(
                  <circle key={i} cx="100" cy="100" r="45" fill="none" stroke={item.color} strokeWidth="18"
                    strokeDasharray={`${dash} ${283 - dash}`} strokeDashoffset={-offset}
                    transform="rotate(-90 100 100)" className="reports-donut-segment"
                    style={{ animationDelay: `${i * 200}ms` }} />
                );
                acc.offset = offset + dash;
                return acc;
              }, { offset: 0, elements: [] }).elements}
            </svg>
            <div className="reports-donut-legend">
              {statusData.map((item, i) => (
                <div key={i} className="reports-legend-item">
                  <span className="reports-legend-dot" style={{ background: item.color }} />
                  <span className="text-xs">{item.label}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{Math.round(item.pct)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{t('reports.tasksByPriority')}</h3>
          <div className="reports-bar-chart">
            {priorityData.map((item, i) => (
              <div key={i} className="reports-bar-row">
                <span className="reports-bar-label text-sm">{item.label}</span>
                <div className="reports-bar-track">
                  <div className="reports-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <span className="reports-bar-value text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card reports-full-width animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{t('reports.tasksByProject')}</h3>
          <div className="reports-project-grid">
            {projectData.map((project, i) => (
              <div key={i} className="reports-project-card">
                <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="sidebar-project-dot" style={{ background: project.color }} />
                  <span className="text-sm" style={{ fontWeight: 600 }}>{project.name}</span>
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {project.completed}/{project.total} {t('tasks.completed').toLowerCase()}
                  </span>
                  <span className="text-sm" style={{ fontWeight: 700, color: project.color }}>{project.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${project.pct}%`, background: `linear-gradient(90deg, ${project.color}, ${project.color}aa)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card reports-full-width animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{t('reports.performance')}</h3>
          <div className="reports-assignee-list">
            {assigneeData.map((person, i) => (
              <div key={i} className="reports-assignee-row">
                <div className="avatar avatar-sm" style={{ background: `hsl(${i * 60}, 60%, 50%)` }}>
                  {person.name.charAt(0)}
                </div>
                <div className="reports-assignee-info">
                  <span className="text-sm" style={{ fontWeight: 500 }}>{person.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {person.completed}/{person.total} · {person.pct}%
                  </span>
                </div>
                <div className="progress-bar" style={{ flex: 1, maxWidth: '200px' }}>
                  <div className="progress-bar-fill" style={{ width: `${person.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
