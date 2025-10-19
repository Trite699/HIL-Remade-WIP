//This is a file used to hold the constants of HIL 'remade'

const properties = {
  TAGS: {
    PAUSE_100: '[#p100]',
    MUSIC_FADE_OUT: '[#bgmfo]',
    MUSIC_STOP: '[#bgms]'
  },

  STRINGS: {
    STOP_MUSIC: '[Stop Music]',
    TEXT_EFFECT_DUAL_TITLEFFECT_DUAL_TITLE: 'Both Effects',
    TEXT_EFFECT_DUAL_DESCRIPTION: 'Perform flash and shake at a certain point',
    TEXT_EFFECT_FLASH_TITLE: 'Flash',
    TEXT_EFFECT_FLASH_DESCRIPTION: 'Perform flash at a certain point',
    UNDEFINED_POSE_NAME: 'Pose stored',
    EVIDENCE_DESC_SEPARATOR: ' | ',
    EVIDENCE_DESC_TOO_LONG: '… (View doc to read more)',
  },

  COLORS: {
    WHITE: "#000",
    BLACK: "#fff"
  },

  EVIDENCE_INFO: {
    NAME_LENGTH: 20,
    DESCRIPTION_LENGTH: 500
  },

  MISC: {
    DEFAULT_TRANSITION: 'transition: .28s cubic-bezier(.4,0,.2,1);',
    SELECTORS_MENU_HOVER: ['.menuable__content__active', 'div.v-sheet.secondary', 'button.v-app-bar__nav-icon', '.mb-2.col-sm-4.col-md-6.col-lg-3.col-6'],
    PAUSE_PUNCTUATION: '.,!?:;',
    URL_REGEX: /((?:http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+(?:[\-\.]{1}[a-z0-9]+)*\.[a-z]{1,5}(?::[0-9]{1,5})?(?:\/.*?)?\w)(\W*?(?:\s|$))/gi,
  },

  STYLES: {
    TESTIMONY_BOX: `
    display: none;
    width: 100%;
    height: 600px;
    resize: none;
    overflow: auto;
    padding: 5px;
    margin: 0;
    border: #552a2e 1px solid;
    background: rgb(18, 18, 18);
    color: white;
    `,

    TESTIMONY_DIV: `
    display: none;
    width: 100%;
    height: 600px;
    overflow: auto;
    padding: 5px 0px;
    margin: 0;
    border: #7f3e44 1px solid;
    `
  }
};
