import { useLocation, useNavigate } from 'react-router-dom';

import settingsIcon from '@/assets/icons/Settings.svg';
import chatIcon from '@/assets/icons/Chat Round.svg';
import historyIcon from '@/assets/icons/History.svg';
import logoutIcon from '@/assets/icons/Logout.svg';
import { useAuth } from '@/hooks/useAuth';

const SIDEBAR_ITEMS = {
  settings: 'settings',
  chat: 'chat',
  history: 'history',
};

function MaskedIcon({ src, className }) {
  return (
    <span
      className={className}
      style={{
        mask: `url("${src}") center / contain no-repeat`,
        WebkitMask: `url("${src}") center / contain no-repeat`,
      }}
      aria-hidden="true"
    />
  );
}

export default function Sidebar({ t }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const activeItem = location.pathname.startsWith('/history') || location.state?.fromHistory ? SIDEBAR_ITEMS.history : SIDEBAR_ITEMS.chat;
  const isActive = (item) => activeItem === item;
  const iconColor = (item) => (isActive(item) ? 'bg-[#4d5dfa]' : 'bg-[#212121] transition duration-150 group-hover:bg-[#4d5dfa]');

  const handleLogout = () => {
    if (!window.confirm(t.sidebar.logoutConfirm)) {
      return;
    }

    logout();
    window.alert(t.sidebar.logoutSuccess);
    navigate('/');
  };

  return (
    <aside
      className="relative h-[calc(100vh-108px)] min-h-[792px] w-[89px] shrink-0 basis-[89px] bg-white"
      data-node-id="642:30587"
      aria-label="Application navigation"
    >
      <button
        className="group absolute left-0 top-[13px] h-[50px] w-[89px] bg-transparent"
        type="button"
        aria-label={t.sidebar.settings}
        onClick={() => navigate('/')}
        aria-pressed={isActive(SIDEBAR_ITEMS.settings)}
      >
        {isActive(SIDEBAR_ITEMS.settings) && (
          <span className="absolute left-0 top-[5px] h-10 w-1.5 rounded-r-[20px] bg-[#4d5dfa]" aria-hidden="true" />
        )}
        <span
          className={`absolute left-5 top-0 inline-flex size-[50px] items-center justify-center rounded-full ${
            isActive(SIDEBAR_ITEMS.settings) ? 'bg-[rgba(77,93,250,0.2)]' : 'bg-white'
          }`}
        >
          <MaskedIcon src={settingsIcon} className={`size-[30px] ${iconColor(SIDEBAR_ITEMS.settings)}`} />
        </span>
      </button>

      <span className="absolute left-[17px] top-[75px] h-px w-[54px] bg-[#dddddd]" aria-hidden="true" />

      <nav className="absolute left-0 top-[102px] flex h-[98px] w-[89px] flex-col items-center justify-between">
        <button
          className="group relative h-10 w-[89px] bg-transparent"
          type="button"
          aria-label={t.sidebar.chat}
          onClick={() => navigate('/')}
          aria-pressed={isActive(SIDEBAR_ITEMS.chat)}
        >
          {isActive(SIDEBAR_ITEMS.chat) && (
            <span className="absolute left-0 top-0 h-10 w-1.5 rounded-r-[20px] bg-[#4d5dfa]" aria-hidden="true" />
          )}
          <span
            className={`absolute left-[25px] top-0 inline-flex size-10 items-center justify-center rounded-full ${
              isActive(SIDEBAR_ITEMS.chat) ? 'bg-[rgba(77,93,250,0.2)]' : 'bg-transparent'
            }`}
          >
            <MaskedIcon src={chatIcon} className={`size-[26px] ${iconColor(SIDEBAR_ITEMS.chat)}`} />
          </span>
        </button>
        <button
          className="group relative inline-flex h-10 w-[89px] items-center justify-center bg-transparent"
          type="button"
          aria-label={t.sidebar.history}
          onClick={() => {
            if (isAuthenticated) {
              navigate('/history');
              return;
            }

            navigate('/login', { state: { returnTo: '/history' } });
          }}
          aria-pressed={isActive(SIDEBAR_ITEMS.history)}
        >
          {isActive(SIDEBAR_ITEMS.history) && (
            <span className="absolute left-0 top-0 h-10 w-1.5 rounded-r-[20px] bg-[#4d5dfa]" aria-hidden="true" />
          )}
          <span
            className={`absolute left-[25px] top-0 inline-flex size-10 items-center justify-center rounded-full ${
              isActive(SIDEBAR_ITEMS.history) ? 'bg-[rgba(77,93,250,0.2)]' : 'bg-transparent'
            }`}
          >
            <MaskedIcon src={historyIcon} className={`size-[30px] ${iconColor(SIDEBAR_ITEMS.history)}`} />
          </span>
        </button>
      </nav>

      <button
        className="absolute bottom-3.5 right-[19px] inline-flex size-[50px] items-center justify-center rounded-full bg-white shadow-[0_0_6.4px_rgba(0,0,0,0.1)] hover:bg-[rgba(77,93,250,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
        type="button"
        aria-label={t.sidebar.logout}
        onClick={handleLogout}
      >
        <span className="inline-flex">
          <img className="size-6" src={logoutIcon} alt="" aria-hidden="true" />
        </span>
      </button>
    </aside>
  );
}
