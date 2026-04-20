import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { ProfileAvatar, IconBell, IconSun, IconMoon, IconSearch, IconX } from '../icons/Icons';
import './Header.css';

export default function Header({ onMenuToggle, title }) {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getVisibleTasks } = useTasks();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const visibleTasks = getVisibleTasks(user?.id, user?.role);
  const overdueTasks = visibleTasks.filter(t => {
    if (t.status === 'completed') return false;
    return new Date(t.deadline) < new Date();
  });
  const todayTasks = visibleTasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.deadline === today && t.status !== 'completed';
  });

  const notifications = [
    ...overdueTasks.slice(0, 3).map(t => ({
      id: t.id,
      type: 'overdue',
      message: `"${t.title}" is overdue`,
      time: t.deadline,
    })),
    ...todayTasks.slice(0, 2).map(t => ({
      id: `today-${t.id}`,
      type: 'today',
      message: `"${t.title}" due today`,
      time: t.deadlineTime || '',
    })),
  ];

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/tasks?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn btn-icon" onClick={onMenuToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-center">
        <div className="header-search">
          <IconSearch size={15} className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder={t('common.search')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
          {searchValue && (
            <button className="header-search-clear" onClick={() => setSearchValue('')}>
              <IconX size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle */}
        <button
          className="btn-icon header-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
        >
          {theme === 'dark' || theme === 'ocean' || theme === 'forest' || theme === 'violet' || theme === 'rose' || theme === 'amber'
            ? <IconSun size={17} />
            : <IconMoon size={17} />
          }
        </button>

        {/* Notifications */}
        <div className="header-notif-wrap" ref={notifRef}>
          <button
            className="btn-icon header-notification"
            title="Notifications"
            onClick={() => setNotifOpen(v => !v)}
          >
            <IconBell size={17} />
            {notifications.length > 0 && <span className="notification-dot" />}
          </button>

          {notifOpen && (
            <div className="notif-dropdown animate-fadeInDown">
              <div className="notif-header">
                <span className="text-sm" style={{ fontWeight: 600 }}>Notifications</span>
                {notifications.length > 0 && (
                  <span className="badge badge-in-progress" style={{ fontSize: '0.65rem' }}>{notifications.length}</span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <IconBell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>All caught up!</span>
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item notif-${n.type}`}>
                      <div className="notif-dot" />
                      <div className="notif-content">
                        <span className="text-sm">{n.message}</span>
                        {n.time && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{n.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-user">
          <ProfileAvatar name={user?.name || 'User'} role={user?.role || 'mvp'} size={32} />
        </div>
      </div>
    </header>
  );
}
