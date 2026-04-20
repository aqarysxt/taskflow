import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { playCreate } from '../hooks/useSound';

export default function TaskModal({ task, onClose, defaultDeadline, defaultDeadlineTime }) {
  const { t } = useTranslation();
  const { user, isAdmin, getAllUsers } = useAuth();
  const { addTask, updateTask, getVisibleProjects } = useTasks();
  const isEditing = !!task;

  const projects = getVisibleProjects(user?.id, user?.role);
  const allUsers = getAllUsers();

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    deadline: task?.deadline || defaultDeadline || new Date().toISOString().split('T')[0],
    deadlineTime: task?.deadlineTime || defaultDeadlineTime || '12:00',
    projectId: task?.projectId || (projects[0]?.id || ''),
    assigneeId: task?.assigneeId || (isAdmin ? '' : user?.id),
    isShared: task?.isShared || false,
    attachments: task?.attachments || [],
  });

  const [newAttachName, setNewAttachName] = useState('');
  const [newAttachUrl, setNewAttachUrl] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addAttachment = () => {
    if (!newAttachName.trim()) return;
    setForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, { name: newAttachName.trim(), url: newAttachUrl.trim() || '#' }]
    }));
    setNewAttachName('');
    setNewAttachUrl('');
  };

  const removeAttachment = (idx) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (isEditing) {
      updateTask(task.id, form);
    } else {
      addTask(form);
      playCreate();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? t('tasks.editTask') : t('tasks.addTask')}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '1.3rem' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>{t('tasks.taskTitle')}</label>
              <input type="text" name="title" className="input" value={form.title} onChange={handleChange} required autoFocus placeholder={t('tasks.taskTitle')} />
            </div>

            <div className="input-group">
              <label>{t('tasks.description')}</label>
              <textarea name="description" className="input" value={form.description} onChange={handleChange} rows={3} placeholder={t('tasks.description')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>{t('tasks.status')}</label>
                <select name="status" className="input" value={form.status} onChange={handleChange}>
                  <option value="pending">{t('tasks.pending')}</option>
                  <option value="in_progress">{t('tasks.inProgress')}</option>
                  <option value="completed">{t('tasks.completed')}</option>
                </select>
              </div>
              <div className="input-group">
                <label>{t('tasks.priority')}</label>
                <select name="priority" className="input" value={form.priority} onChange={handleChange}>
                  <option value="high">{t('tasks.high')}</option>
                  <option value="medium">{t('tasks.medium')}</option>
                  <option value="low">{t('tasks.low')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>{t('tasks.deadline')}</label>
                <input type="date" name="deadline" className="input" value={form.deadline} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>{t('tasks.time')}</label>
                <input type="time" name="deadlineTime" className="input" value={form.deadlineTime} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>{t('tasks.project')}</label>
                <select name="projectId" className="input" value={form.projectId} onChange={handleChange}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>{t('tasks.assignee')}</label>
                <select name="assigneeId" className="input" value={form.assigneeId} onChange={handleChange}>
                  <option value="">— {t('tasks.assignee')} —</option>
                  {isAdmin
                    ? allUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)
                    : <option value={user?.id}>{user?.name}</option>
                  }
                </select>
              </div>
            </div>

            {/* Shared checkbox — admin only */}
            {isAdmin && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isShared" checked={form.isShared} onChange={handleChange} style={{ width: 16, height: 16 }} />
                {t('tasks.shared')}
              </label>
            )}

            {/* Attachments */}
            <div className="input-group">
              <label>{t('tasks.attachments')}</label>
              {form.attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--space-2)' }}>
                  {form.attachments.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                      <span>📎</span>
                      <span style={{ flex: 1 }}>{a.name}</span>
                      <button type="button" className="btn-ghost" onClick={() => removeAttachment(i)} style={{ fontSize: '0.8rem', padding: '2px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input type="text" className="input" placeholder={t('tasks.attachmentName')} value={newAttachName} onChange={(e) => setNewAttachName(e.target.value)} style={{ flex: 1 }} />
                <input type="text" className="input" placeholder={t('tasks.attachmentUrl')} value={newAttachUrl} onChange={(e) => setNewAttachUrl(e.target.value)} style={{ flex: 1 }} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addAttachment}>+</button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('tasks.cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('tasks.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
