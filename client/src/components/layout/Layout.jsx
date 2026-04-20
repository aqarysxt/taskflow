import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const PAGE_TITLES = {
  '/':          'nav.dashboard',
  '/tasks':     'nav.tasks',
  '/calendar':  'nav.calendar',
  '/reports':   'nav.reports',
  '/projects':  'nav.projects',
  '/users':     'nav.users',
  '/settings':  'nav.settings',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const titleKey = PAGE_TITLES[location.pathname] || 'nav.dashboard';

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          title={t(titleKey)}
        />
        <main className="layout-content" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
