import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { playCreate, playDelete } from '../hooks/useSound';
import { ProfileAvatar, IconTrash, IconCheck, IconX, IconPlus, IconUsers } from '../components/icons/Icons';
import './UsersPage.css';

export default function UsersPage() {
  const { t } = useTranslation();
  const { user, getAllUsers, addUser, deleteUser, updateUserRole } = useAuth();
  const users = getAllUsers();

  const [showModal, setShowModal]           = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm]                     = useState({ name: '', email: '', password: 'mvp123', role: 'mvp' });
  const [error, setError]                   = useState('');

  const admins = users.filter(u => u.role === 'admin');
  const mvps   = users.filter(u => u.role === 'mvp');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return; }
    const result = await addUser(form);
    if (!result) { setError('Email already exists'); return; }
    playCreate();
    setForm({ name: '', email: '', password: 'mvp123', role: 'mvp' });
    setShowModal(false);
  };

  const handleDelete = async (userId) => {
    await deleteUser(userId);
    playDelete();
    setDeleteConfirmId(null);
  };

  const handleRoleToggle = (userId, currentRole) =>
    updateUserRole(userId, currentRole === 'admin' ? 'mvp' : 'admin');

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-header animate-fadeInUp">
        <div>
          <h2>{t('users.title')}</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)', marginTop: 4 }}>
            Manage team members and their roles
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus size={15} /> {t('users.addUser')}
        </button>
      </div>

      {/* Stats */}
      <div className="users-stats stagger-children">
        {[
          { label: t('users.totalUsers'), value: users.length,   color: 'var(--primary-400)',  bg: 'rgba(59,130,246,0.12)',  Icon: IconUsers },
          { label: t('users.admins'),     value: admins.length,  color: '#f59e0b',              bg: 'rgba(245,158,11,0.12)',  Icon: IconUsers },
          { label: t('users.mvps'),       value: mvps.length,    color: 'var(--success-400)',   bg: 'rgba(34,197,94,0.12)',   Icon: IconUsers },
        ].map((s, i) => (
          <div key={i} className="glass-card users-stat-card">
            <span className="users-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.Icon size={20} />
            </span>
            <div className="users-stat-info">
              <span className="users-stat-label">{s.label}</span>
              <span className="users-stat-number">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Users List */}
      <div className="users-list stagger-children">
        {users.map(u => (
          <div key={u.id} className="glass-card users-card">
            <div className="users-card-left">
              <ProfileAvatar name={u.name} role={u.role} size={40} />
              <div className="users-card-info">
                <span className="users-card-name">{u.name}</span>
                <span className="users-card-email text-xs">{u.email}</span>
              </div>
            </div>
            <div className="users-card-right">
              <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-mvp'}`}>
                {u.role === 'admin' ? `⭐ ${t('users.admin')}` : t('users.mvp')}
              </span>
              {u.id !== user?.id ? (
                <div className="users-card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRoleToggle(u.id, u.role)}>
                    {u.role === 'admin' ? t('users.demote') : t('users.promote')}
                  </button>
                  {deleteConfirmId === u.id ? (
                    <div className="users-delete-confirm">
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                        <IconCheck size={12} /> {t('common.delete')}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)}>
                        <IconX size={12} />
                      </button>
                    </div>
                  ) : (
                    <button className="btn-ghost" onClick={() => setDeleteConfirmId(u.id)} title={t('common.delete')}>
                      <IconTrash size={15} />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>(you)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('users.addUser')}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><IconX size={18} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {error && <div className="auth-error">{error}</div>}
                <div className="input-group">
                  <label>{t('users.name')}</label>
                  <input type="text" className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required autoFocus />
                </div>
                <div className="input-group">
                  <label>{t('users.email')}</label>
                  <input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>{t('users.password')}</label>
                  <input type="text" className="input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label>{t('users.role')}</label>
                  <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="mvp">{t('users.mvp')}</option>
                    <option value="admin">{t('users.admin')}</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('users.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
