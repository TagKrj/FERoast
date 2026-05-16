import { FIGMA_ASSETS } from '@/constants/assets';
import { LANGUAGES } from '@/constants/locales';
import { FlagIcon, RecordIcon } from '@/components/FigmaIcons';

export default function Footer({ language, onLanguageChange, t }) {
  const currentLanguage = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  return (
    <footer className="app-footer" data-node-id="642:30590">
      <div className="footer-copyright">
        <RecordIcon />
        <span>{t.footer.copyright}</span>
      </div>

      <div className="footer-actions">
        <nav className="footer-links" aria-label="Footer links">
          <a href="#privacy">{t.footer.privacyPolicy}</a>
          <a href="#terms">{t.footer.termsOfService}</a>
          <a href="#cookies">{t.footer.cookieSettings}</a>
        </nav>
        <span className="footer-divider" aria-hidden="true" />
        <label className="language-control">
          <span className="sr-only">{t.footer.language}</span>
          <FlagIcon code={currentLanguage.code} alt={currentLanguage.flagAlt} />
          <span className="language-label">{currentLanguage.label}</span>
          <img className="language-arrow" src={FIGMA_ASSETS.footer.arrowDown} alt="" aria-hidden="true" />
          <select
            aria-label={t.footer.language}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </footer>
  );
}
