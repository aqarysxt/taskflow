import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { ProfileAvatar, IconDashboard, IconTasks, IconCalendar, IconReports, IconUsers, IconProjects, IconSettings, IconLogout } from '../icons/Icons';
import './Sidebar.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'kk', label: 'KZ', name: 'Қазақша' },
];

const NAV_ICONS = {
  dashboard: IconDashboard,
  tasks: IconTasks,
  calendar: IconCalendar,
  reports: IconReports,
  users: IconUsers,
  projects: IconProjects,
  settings: IconSettings,
};

export default function Sidebar({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { getVisibleProjects } = useTasks();

  const projects = getVisibleProjects(user?.id, user?.role);

  const NAV_ITEMS = [
    { path: '/',         key: 'dashboard' },
    { path: '/tasks',    key: 'tasks' },
    { path: '/calendar', key: 'calendar' },
    { path: '/reports',  key: 'reports' },
    { path: '/projects', key: 'projects' },
    ...(isAdmin ? [{ path: '/users', key: 'users' }] : []),
    { path: '/settings', key: 'settings' },
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('taskflow-language', code);
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><span>T</span></div>
          <div className="sidebar-logo-text">
            <h2>TaskFlow</h2>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('app.tagline')}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{t('nav.dashboard').toUpperCase()}</div>
          {NAV_ITEMS.map(item => {
            const Icon = NAV_ICONS[item.key];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                onClick={onClose}
              >
                <span className="sidebar-link-icon">{Icon && <Icon size={17} />}</span>
                <span>{t(`nav.${item.key}`)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Projects */}
        {projects.length > 0 && (
          <div className="sidebar-projects">
            <div className="sidebar-section-label" style={{ marginBottom: '12px' }}>
              {t('nav.projects').toUpperCase()}
            </div>
            {projects.slice(0, 5).map(project => (
              <div key={project.id} className="sidebar-project-item">
                <span className="sidebar-project-dot" style={{ background: project.color }} />
                <span className="truncate" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{project.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Language Switcher */}
        <div className="sidebar-lang">
          <div className="sidebar-section-label">{t('settings.language').toUpperCase()}</div>
          <div className="lang-switcher">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`lang-btn ${i18n.language === lang.code ? 'lang-btn-active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
                title={lang.name}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Area */}
        <div className="sidebar-user">
          <ProfileAvatar name={user?.name || 'User'} role={user?.role || 'mvp'} size={34} />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name truncate">{user?.name || 'User'}</span>
            <span className="sidebar-user-role text-xs">
              {isAdmin ? '⭐ Admin' : 'MVP'}
            </span>
          </div>
          <button className="btn-ghost sidebar-logout" onClick={logout} title={t('nav.logout')}>
            <IconLogout size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}
