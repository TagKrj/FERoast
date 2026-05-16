const figmaAsset = (fileName) => `/assets/figma/${fileName}`;

export const FIGMA_ASSETS = {
  header: {
    logo: figmaAsset('header-logo.png'),
    avatar: figmaAsset('header-avatar.svg'),
    bellBody: figmaAsset('header-bell-body.svg'),
    bellClapper: figmaAsset('header-bell-clapper.svg'),
  },
  sidebar: {
    chat: figmaAsset('sidebar-chat.svg'),
    historyHand: figmaAsset('sidebar-history-hand.svg'),
    historyCircle: figmaAsset('sidebar-history-circle.svg'),
    settingsDot: figmaAsset('sidebar-settings-dot.svg'),
    settingsBody: figmaAsset('sidebar-settings-body.svg'),
    downloadBase: figmaAsset('sidebar-download-base.svg'),
    downloadArrow: figmaAsset('sidebar-download-arrow.svg'),
  },
  footer: {
    recordRing: figmaAsset('footer-record-ring.svg'),
    recordDot: figmaAsset('footer-record-dot.svg'),
    arrowDown: figmaAsset('footer-arrow-down.svg'),
  },
  body: {
    addRing: figmaAsset('body-add-ring.svg'),
    addPlus: figmaAsset('body-add-plus.svg'),
    play: figmaAsset('body-play.svg'),
    starA: figmaAsset('body-star-a.svg'),
    starB: figmaAsset('body-star-b.svg'),
    sendButton: figmaAsset('body-send-button.svg'),
  },
  flags: {
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
  },
};
