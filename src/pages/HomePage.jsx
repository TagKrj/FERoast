import { useOutletContext } from 'react-router-dom';

import { FIGMA_ASSETS } from '@/constants/assets';
import { AddCircleIcon, PlayIcon, StarsIcon } from '@/components/FigmaIcons';

export default function HomePage() {
  const { t } = useOutletContext();

  return (
    <section className="home-page" data-node-id="642:30588">
      <div className="home-toolbar" data-node-id="667:30808">
        <button className="new-chat-button" type="button">
          <AddCircleIcon />
          <span>{t.home.newChat}</span>
        </button>
      </div>

      <div className="home-stage" data-node-id="667:30800">
        <div className="home-entry" data-node-id="667:30840">
          <div className="home-heading-row" data-node-id="667:33124">
            <div className="home-heading">
              <h1>{t.home.title}</h1>
              <p>{t.home.subtitle}</p>
            </div>
            <span className="home-orb" aria-hidden="true" />
          </div>

          <div className="repo-entry">
            <div className="step-pill">
              <PlayIcon />
              <span>{t.home.stepOne}</span>
            </div>

            <div className="repo-input-shell">
              <div className="repo-placeholder">
                <StarsIcon />
                <span>{t.home.repoPlaceholder}</span>
              </div>
              <button className="repo-submit" type="button" aria-label={t.home.submitRepo}>
                <img src={FIGMA_ASSETS.body.sendButton} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
