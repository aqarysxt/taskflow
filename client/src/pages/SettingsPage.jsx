import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { ProfileAvatar, IconCheck } from '../components/icons/Icons';
import './SettingsPage.css';

const LANGUAGES = [
  { code: 'en', name: 'English',  flag: '🇺🇸' },
  { code: 'ru', name: 'Русский',  flag: '🇷🇺' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name,    setName]    = useState(user?.name || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [saved,   setSaved]   = useState(false);
  const [twoFA,   setTwoFA]   = useState(false);
  const [twoCode, setTwoCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('taskflow-language', code);
  };

  const handle2FAVerify = () => {
    if (twoCode.length === 6) {
      setVerified(true);
      setTimeout(() => setVerified(false), 3000);
    }
  };

  return (
    <div className="settings-page">

      {/* ── Profile ─────────────────────────────────────────────────────── */}
      <div className="glass-card settings-section animate-fadeInUp">
        <h3 className="settings-section-title">{t('settings.profile')}</h3>
        <div className="settings-profile">
          <ProfileAvatar name={user?.name || 'User'} role={user?.role || 'mvp'} size={56} />
          <div className="settings-profile-info">
            <h4>{user?.name || 'User'}</h4>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</span>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-mvp'}`} style={{ marginTop: 4, width: 'fit-content' }}>
              {isAdmin ? '⭐ Admin' : '👤 MVP'}
            </span>
          </div>
        </div>

        <div className="settings-form-row">
          <div className="input-group" style={{ flex: 1 }}>
            <label>{t('auth.name')}</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <button
            className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleSave}
            style={{ alignSelf: 'flex-end', minWidth: 100 }}
          >
            {saved ? <><IconCheck size={14} /> Saved!</> : t('settings.saveName')}
          </button>
        </div>

        <div className="settings-form-row" style={{ marginTop: 'var(--space-3)' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>{t('auth.email')}</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} disabled style={{ opacity: 0.6 }} />
          </div>
          <div style={{ alignSelf: 'flex-end', minWidth: 100, padding: '0 var(--space-2)' }}>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Cannot change email</span>
          </div>
        </div>
      </div>

      {/* ── Appearance / Themes ─────────────────────────────────────────── */}
      <div className="glass-card settings-section animate-fadeInUp" style={{ animationDelay: '80ms' }}>
        <h3 className="settings-section-title">{t('settings.theme')}</h3>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
          Choose a visual theme for your workspace
        </p>
        <div className="settings-theme-grid">
          {THEMES.map(th => (
            <button
              key={th.id}
              className={`settings-theme-card ${theme === th.id ? 'settings-theme-active' : ''}`}
              onClick={() => setTheme(th.id)}
            >
              {/* Preview swatch */}
              <div className="theme-preview-swatch">
                <div className="theme-swatch-bg"   style={{ background: th.preview[0] }} />
                <div className="theme-swatch-card" style={{ background: th.preview[1] }}>
                  <div className="theme-swatch-accent" style={{ background: th.preview[2] }} />
                </div>
              </div>
              <span className="settings-theme-icon">{th.icon}</span>
              <span className="settings-theme-label">{th.name}</span>
              <span className="settings-theme-desc text-xs">{th.description}</span>
              {theme === th.id && (
                <div className="settings-theme-check">
                  <IconCheck size={11} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Language ────────────────────────────────────────────────────── */}
      <div className="glass-card settings-section animate-fadeInUp" style={{ animationDelay: '140ms' }}>
        <h3 className="settings-section-title">{t('settings.language')}</h3>
        <div className="settings-lang-grid">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`settings-lang-card ${i18n.language === lang.code ? 'settings-lang-active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="settings-lang-flag">{lang.flag}</span>
              <span className="settings-lang-name">{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="settings-lang-check"><IconCheck size={12} /></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Security ────────────────────────────────────────────────────── */}
      <div className="glass-card settings-section animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        <h3 className="settings-section-title">{t('settings.security')}</h3>
        <div className="settings-security-row">
          <div>
            <h4 style={{ marginBottom: 4 }}>{t('auth.twoFactor')}</h4>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            className={`btn ${twoFA ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { setTwoFA(v => !v); setVerified(false); setTwoCode(''); }}
          >
            {twoFA ? t('auth.disable2FA') : t('auth.enable2FA')}
          </button>
        </div>

        {twoFA && (
          <div className="settings-2fa-panel animate-fadeInUp">
            <div className="settings-2fa-qr">
              <div className="settings-qr-placeholder">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  {/* Simulated QR code pattern */}
                  {[0,1,2,3,4,5,6].map(row =>
                    [0,1,2,3,4,5,6].map(col => {
                      const corner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
                      const on = corner || ((row + col + row * col) % 3 === 0);
                      return on ? (
                        <rect key={`${row}-${col}`} x={col * 11 + 4} y={row * 11 + 4} width={9} height={9}
                          rx="1" fill="currentColor" opacity={corner ? 1 : 0.7} />
                      ) : null;
                    })
                  )}
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 220 }}>
                Scan with Google Authenticator or Authy
              </p>
            </div>
            <div className="input-group" style={{ maxWidth: 260 }}>
              <label>{t('auth.enterCode')}</label>
              <input
                type="text"
                className="input"
                placeholder="000 000"
                maxLength={7}
                value={twoCode}
                onChange={e => setTwoCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                style={{ letterSpacing: '0.25em', fontSize: '1.1rem', textAlign: 'center' }}
              />
            </div>
            <button
              className={`btn ${verified ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handle2FAVerify}
              disabled={twoCode.length < 6}
            >
              {verified ? <><IconCheck size={14} /> Verified!</> : t('auth.verify')}
            </button>
          </div>
        )}

        {/* Password change row */}
        <div className="settings-security-row" style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <h4 style={{ marginBottom: 4 }}>Password</h4>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Last changed: Never</p>
          </div>
          <button className="btn btn-secondary">Change Password</button>
        </div>
      </div>

      {/* ── Notifications ───────────────────────────────────────────────── */}
      <div className="glass-card settings-section animate-fadeInUp" style={{ animationDelay: '260ms' }}>
        <h3 className="settings-section-title">Notifications</h3>
        {[
          { label: 'Task due reminders',   desc: 'Get notified before tasks are due' },
          { label: 'Overdue alerts',        desc: 'Alert when a task becomes overdue' },
          { label: 'Team activity',         desc: 'Notify on shared task changes' },
        ].map((item, i) => (
          <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={i < 2} />
        ))}
      </div>

      {/* ── About ───────────────────────────────────────────────────────── */}
      <div className="glass-card settings-section animate-fadeInUp" style={{ animationDelay: '320ms' }}>
        <h3 className="settings-section-title">About</h3>
        <div className="settings-about">
          <div className="settings-about-logo">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>T</div>
            <div>
              <p className="text-sm" style={{ fontWeight: 600 }}>TaskFlow</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Modern Task Management</p>
            </div>
          </div>
          <div className="settings-about-meta">
            <span className="badge badge-in-progress">v2.0.0</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>React 19 + Vite 8 + Dexie (IndexedDB)</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Admin & MVP roles · 7 themes · i18n</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function NotifToggle({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="settings-notif-row">
      <div>
        <p className="text-sm" style={{ fontWeight: 500 }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>{desc}</p>
      </div>
      <button
        className={`notif-toggle ${on ? 'notif-toggle-on' : ''}`}
        onClick={() => setOn(v => !v)}
        aria-label={label}
      >
        <span className="notif-toggle-knob" />
      </button>
    </div>
  );
}
