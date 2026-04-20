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

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('taskflow-language', code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setTimeout(async () => {
      const success = await register(name, email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email already in use');
      }
      setLoading(false);
    }, 500);
  };

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
          <h2>{t('auth.registerTitle')}</h2>
          <p className="auth-card-subtitle">{t('auth.registerSubtitle')}</p>
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>{t('auth.name')}</label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" autoFocus />
            </div>
            <div className="input-group">
              <label>{t('auth.email')}</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="input-group">
              <label>{t('auth.password')}</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat your password" />
            </div>

            <button type="submit" className={`btn btn-primary btn-lg w-full auth-submit ${loading ? 'auth-loading' : ''}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : t('auth.register')}
            </button>
          </form>

          <div className="auth-footer">
            <span>{t('auth.hasAccount')}</span>
            <Link to="/login" className="auth-link">{t('auth.login')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
