import { ChatIcon, DownloadIcon, HistoryIcon, SettingsIcon } from '@/components/FigmaIcons';

export default function Sidebar({ t }) {
  return (
    <aside className="app-sidebar" data-node-id="642:30587" aria-label="Application navigation">
      <button className="sidebar-settings" type="button" aria-label={t.sidebar.settings}>
        <SettingsIcon />
      </button>

      <span className="sidebar-divider" aria-hidden="true" />

      <nav className="sidebar-nav">
        <button className="sidebar-nav-item is-active" type="button" aria-label={t.sidebar.chat}>
          <span className="sidebar-active-indicator" aria-hidden="true" />
          <span className="sidebar-active-pill">
            <ChatIcon />
          </span>
        </button>
        <button className="sidebar-nav-icon" type="button" aria-label={t.sidebar.history}>
          <HistoryIcon />
        </button>
      </nav>

      <button className="sidebar-download" type="button" aria-label={t.sidebar.download}>
        <span className="sidebar-download-icon">
          <DownloadIcon />
        </span>
      </button>
    </aside>
  );
}
