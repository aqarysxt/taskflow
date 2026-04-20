import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
];

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('admin@taskflow.com');
  const [password, setPassword] = useState('admin123');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('taskflow-language', code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(async () => {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 500);
  };

  const demoAccounts = [
    { label: 'Admin',   email: 'admin@taskflow.com',   pw: 'admin123' },
    { label: 'Alice',   email: 'alice@taskflow.com',   pw: 'mvp123'   },
    { label: 'Bob',     email: 'bob@taskflow.com',     pw: 'mvp123'   },
    { label: 'Charlie', email: 'charlie@taskflow.com', pw: 'mvp123'   },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-lang-bar">
        {LANGUAGES.map(lang => (
          <button key={lang.code} className={`lang-btn ${i18n.language === lang.code ? 'lang-btn-active' : ''}`} onClick={() => changeLanguage(lang.code)}>
            {lang.label}
          </button>
        ))}
      </div>

      <div className="auth-container animate-fadeInUp">
        <div className="auth-logo">
          <div className="auth-logo-icon">T</div>
          <h1>TaskFlow</h1>
          <p className="auth-subtitle">{t('app.tagline')}</p>
        </div>

        <div className="auth-card glass-card-elevated">
          <h2>{t('auth.loginTitle')}</h2>
          <p className="auth-card-subtitle">{t('auth.loginSubtitle')}</p>
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>{t('auth.email')}</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="input-group">
              <label>{t('auth.password')}</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            <button type="submit" className={`btn btn-primary btn-lg w-full auth-submit ${loading ? 'auth-loading' : ''}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : t('auth.login')}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="auth-demo-section">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 8 }}>
              Quick Demo Accounts
            </p>
            <div className="auth-demo-accounts">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pw); }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-footer">
            <span>{t('auth.noAccount')}</span>
            <Link to="/register" className="auth-link">{t('auth.register')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
