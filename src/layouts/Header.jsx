import { FIGMA_ASSETS } from '@/constants/assets';
import { BellIcon } from '@/components/FigmaIcons';

export default function Header({ t }) {
  return (
    <header className="app-header" data-node-id="641:30047">
      <div className="header-brand">
        <img className="header-logo" src={FIGMA_ASSETS.header.logo} alt={t.brand.logoAlt} />
        <span className="header-brand-name">{t.brand.name}</span>
      </div>

      <div className="header-actions">
        <button className="icon-button header-notification" type="button" aria-label={t.header.notifications}>
          <BellIcon />
        </button>
        <span className="header-divider" aria-hidden="true" />
        <img className="header-avatar" src={FIGMA_ASSETS.header.avatar} alt={t.header.avatarAlt} />
      </div>
    </header>
  );
}
