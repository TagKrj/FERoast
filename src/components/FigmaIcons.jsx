const figmaAsset = (fileName) => `/assets/figma/${fileName}`;

const FLAG_LAYERS = {
  vi: [figmaAsset('footer-flag-vn.svg')],
  en: [
    figmaAsset('flag-gb-layer-1.svg'),
    figmaAsset('flag-gb-layer-2.svg'),
    figmaAsset('flag-gb-layer-3.svg'),
    figmaAsset('flag-gb-layer-4.svg'),
    figmaAsset('flag-gb-layer-5.svg'),
    figmaAsset('flag-gb-layer-6.svg'),
    figmaAsset('flag-gb-layer-7.svg'),
    figmaAsset('flag-gb-layer-8.svg'),
    figmaAsset('flag-gb-layer-9.svg'),
    figmaAsset('flag-gb-layer-10.svg'),
    figmaAsset('flag-gb-layer-11.svg'),
    figmaAsset('flag-gb-layer-12.svg'),
  ],
  no: [
    figmaAsset('flag-no-layer-1.svg'),
    figmaAsset('flag-no-layer-2.svg'),
    figmaAsset('flag-no-layer-3.svg'),
  ],
};

export function FlagIcon({ code, alt = '', className = '' }) {
  const layers = FLAG_LAYERS[code] || FLAG_LAYERS.en;

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
