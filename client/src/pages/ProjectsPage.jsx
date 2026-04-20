import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { playCreate, playDelete, playStatusChange } from '../hooks/useSound';
import { ProfileAvatar, IconEdit, IconTrash, IconPlus, IconX, IconCheck } from '../components/icons/Icons';
import './ProjectsPage.css';

const PRESET_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#84cc16','#f97316','#06b6d4',
];

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { user, isAdmin, getAllUsers } = useAuth();
  const { getVisibleProjects, getTasksByProject, addProject, updateProject, deleteProject } = useTasks();

  const projects  = getVisibleProjects(user?.id, user?.role);
  const allUsers  = getAllUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: PRESET_COLORS[0], assignedUserIds: [] });

  const openCreate = () => {
    setEditingProject(null);
    setForm({ name: '', description: '', color: PRESET_COLORS[0], assignedUserIds: [] });
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setForm({ name: project.name, description: project.description || '', color: project.color, assignedUserIds: project.assignedUserIds || [] });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteProject(id);
    playDelete();
    setDeleteConfirmId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingProject) {
      updateProject(editingProject.id, form);
      playStatusChange();
    } else {
      addProject(form);
      playCreate();
    }
    setModalOpen(false);
  };

  const toggleUserAssigned = (userId) => {
    setForm(prev => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter(id => id !== userId)
        : [...prev.assignedUserIds, userId],
    }));
  };

  return (
    <div className="projects-page">
      {/* Header */}
      <div className="projects-header animate-fadeInUp">
        <div>
          <h2>{t('projects.title')}</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)', marginTop: 4 }}>
            {isAdmin ? 'Manage all workspaces and team assignments' : 'Browse your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus size={15} /> {t('projects.addProject')}
          </button>
        )}
      </div>

      {/* Role notice for MVP */}
      {!isAdmin && (
        <div className="projects-mvp-notice animate-fadeInUp">
          <span>👁  You have read-only access. Contact an admin to create or modify projects.</span>
        </div>
      )}

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>{t('projects.noProjects')}</h3>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 'var(--space-4)' }}>
              <IconPlus size={15} /> {t('projects.addProject')}
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid stagger-children">
          {projects.map((project) => {
            const projectTasks   = getTasksByProject(project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            const progress       = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

            return (
              <div key={project.id} className="glass-card project-card">
                <div className="project-card-header">
                  <div className="project-card-title-wrap">
                    <span className="project-card-dot" style={{ background: project.color }} />
                    <h3 className="project-card-title truncate">{project.name}</h3>
                  </div>
                  {isAdmin && (
                    <div className="project-card-actions">
                      <button className="btn-ghost btn-sm" onClick={() => openEdit(project)} title="Edit">
                        <IconEdit size={14} />
                      </button>
                      {deleteConfirmId === project.id ? (
                        <div className="project-delete-confirm">
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>
                            <IconCheck size={12} />
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)}>
                            <IconX size={12} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn-ghost btn-sm" onClick={() => setDeleteConfirmId(project.id)} title="Delete">
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="project-card-desc text-sm">{project.description || 'No description provided.'}</p>

                <div className="project-card-stats">
                  <div className="project-stat-item">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('projects.taskCount')}</span>
                    <span style={{ fontWeight: 600 }}>{projectTasks.length}</span>
                  </div>
                  <div className="project-stat-item">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Progress</span>
                    <span style={{ fontWeight: 600, color: project.color }}>{progress}%</span>
                  </div>
                  <div className="project-stat-item">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Done</span>
                    <span style={{ fontWeight: 600, color: 'var(--success-400)' }}>{completedTasks}</span>
                  </div>
                </div>

                <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)` }} />
                </div>

                <div className="project-card-users">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('projects.assignedUsers')}:</span>
                  <div className="project-users-list">
                    {project.assignedUserIds?.slice(0, 5).map(uid => {
                      const u = allUsers.find(user => user.id === uid);
                      return u ? (
                        <ProfileAvatar key={uid} name={u.name} role={u.role} size={26} title={u.name} />
                      ) : null;
                    })}
                    {project.assignedUserIds?.length > 5 && (
                      <div className="avatar avatar-sm project-user-more">+{project.assignedUserIds.length - 5}</div>
                    )}
                    {(!project.assignedUserIds || project.assignedUserIds.length === 0) && (
                      <span className="text-xs" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>None assigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — admin only */}
      {modalOpen && isAdmin && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProject ? t('projects.editProject') : t('projects.addProject')}</h3>
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>
                <IconX size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label>{t('projects.projectName')}</label>
                  <input type="text" className="input" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required autoFocus />
                </div>
                <div className="input-group">
                  <label>{t('projects.description')}</label>
                  <textarea className="input" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
                </div>
                <div className="input-group">
                  <label>{t('projects.color')}</label>
                  <div className="project-color-picker">
                    {PRESET_COLORS.map(c => (
                      <button key={c} type="button"
                        className={`project-color-btn ${form.color === c ? 'project-color-active' : ''}`}
                        style={{ background: c }}
                        onClick={() => setForm(prev => ({ ...prev, color: c }))}
                      />
                    ))}
                    <input type="color" value={form.color}
                      onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                      className="project-color-custom" title="Custom color"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>{t('projects.assignedUsers')}</label>
                  <div className="project-assign-list">
                    {allUsers.map(u => (
                      <label key={u.id} className="project-assign-item">
                        <input type="checkbox" checked={form.assignedUserIds.includes(u.id)} onChange={() => toggleUserAssigned(u.id)} />
                        <ProfileAvatar name={u.name} role={u.role} size={26} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="text-sm">{u.name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.role}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
