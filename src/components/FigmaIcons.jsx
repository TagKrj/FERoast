import { FIGMA_ASSETS } from '@/constants/assets';

function IconImage({ src, className = '', alt = '' }) {
  return <img aria-hidden={alt ? undefined : true} alt={alt} className={className} src={src} />;
}

export function BellIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--bell ${className}`} aria-hidden="true">
      <IconImage className="vc-layer bell-body" src={FIGMA_ASSETS.header.bellBody} />
      <IconImage className="vc-layer bell-clapper" src={FIGMA_ASSETS.header.bellClapper} />
    </span>
  );
}

export function SettingsIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--settings ${className}`} aria-hidden="true">
      <IconImage className="vc-layer settings-body" src={FIGMA_ASSETS.sidebar.settingsBody} />
      <IconImage className="vc-layer settings-dot" src={FIGMA_ASSETS.sidebar.settingsDot} />
    </span>
  );
}

export function ChatIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--chat ${className}`} aria-hidden="true">
      <IconImage className="vc-layer layer-full" src={FIGMA_ASSETS.sidebar.chat} />
    </span>
  );
}

export function HistoryIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--history ${className}`} aria-hidden="true">
      <IconImage className="vc-layer history-circle" src={FIGMA_ASSETS.sidebar.historyCircle} />
      <IconImage className="vc-layer history-hand" src={FIGMA_ASSETS.sidebar.historyHand} />
    </span>
  );
}

export function DownloadIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--download ${className}`} aria-hidden="true">
      <IconImage className="vc-layer download-base" src={FIGMA_ASSETS.sidebar.downloadBase} />
      <IconImage className="vc-layer download-arrow" src={FIGMA_ASSETS.sidebar.downloadArrow} />
    </span>
  );
}

export function RecordIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--record ${className}`} aria-hidden="true">
      <IconImage className="vc-layer record-ring" src={FIGMA_ASSETS.footer.recordRing} />
      <IconImage className="vc-layer record-dot" src={FIGMA_ASSETS.footer.recordDot} />
    </span>
  );
}

export function AddCircleIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--add ${className}`} aria-hidden="true">
      <IconImage className="vc-layer add-ring" src={FIGMA_ASSETS.body.addRing} />
      <IconImage className="vc-layer add-plus" src={FIGMA_ASSETS.body.addPlus} />
    </span>
  );
}

export function PlayIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--play ${className}`} aria-hidden="true">
      <IconImage className="vc-layer layer-full" src={FIGMA_ASSETS.body.play} />
    </span>
  );
}

export function StarsIcon({ className = '' }) {
  return (
    <span className={`vc-icon vc-icon--stars ${className}`} aria-hidden="true">
      <IconImage className="vc-layer star-a" src={FIGMA_ASSETS.body.starA} />
      <IconImage className="vc-layer star-b" src={FIGMA_ASSETS.body.starB} />
    </span>
  );
}

export function FlagIcon({ code, alt = '', className = '' }) {
  const layers = FIGMA_ASSETS.flags[code] || FIGMA_ASSETS.flags.en;

  if (code === 'vi') {
    return (
      <span className={`flag-icon ${className}`}>
        <img alt={alt} src={layers[0]} />
      </span>
    );
  }

  return (
    <span className={`flag-icon ${className}`} role="img" aria-label={alt}>
      {layers.map((src, index) => (
        <img
          aria-hidden="true"
          className={code === 'en' ? `flag-gb-layer flag-gb-layer-${index + 1}` : 'flag-full-layer'}
          key={src}
          src={src}
          alt=""
        />
      ))}
    </span>
  );
}
