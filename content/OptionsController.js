"use strict";

const FileHelpers = helpersUtils;
const FileExts = extUtils;
const FileConstants = properties;
const clsTestimony = Testimony;

class CourtroomOptionsHandler {
    constructor(courtroom) {
        this.Courtroom = courtroom;
        this.UI_Element_Options = ['testimony-mode', 'now-playing', 'smart-tn', 'tts', 'quick-sfx'];
        this.injectorOptions = ['testimony-mode', 'no-talk-toggle', 'dont-delay-toggle', 'smart-tn', 'now-playing', 'list-moderation', 'mute-character',
        'fullscreen-evidence', 'volume-sliders', 'pose-icon-maker', 'disable-testimony-shortcut', 'unblur-low-res', 'save-last-character',
        'fix-tag-nesting', 'newlines', 'menu-auto-close', 'old-bubbles', 'export-cc-images']
        
        this.TabState = {
            NONE: {
                enabled: true,
                onEnable: () => this.hilTabSeparator.classList.add('hil-hide'),
                onDisable: () => this.hilTabSeparator.classList.remove('hil-hide')
            },
            TESTIMONY: {},
            TN: {},
            TTS: {},
            QUICKSFX: {}
        }
    }

    init() {
        if(this.UI_Element_Options.some(selections => this.Courtroom.options[selections])) {
            this.injectMdiIcons();
            this.uiInit();
            this.hilToggleDots.addEventListener('click', () => {
                this.toggleHILDots();
            });
            
            //this._setUpNowPlayingUI();
            this._setupTestimonyModeUI();
        }
    }

    _injectScripts() {
        if(this.Courtroom.options['smart-tn']) FileExts.scripts.injectScript(chrome.runtime.getURL('inject/closest-match-closest-match.js'));
        if(this.Courtroom.options['pose-icon-maker'] || this.Courtroom.options['export-cc-images']) FileExts.scripts.injectScript(chrome.runtime.getURL('inject/jsZip.min.js'));
        if(this.Courtroom.options['extended-log']) this._injectExtendedLog();
        if(this.injectorOptions.some(opts => this.Courtroom.options[opts]) || socketStates.options['export-cc-images']) {
            FileExts.scripts.injectScript(chrome.runtime.getURL('content/utils.js'));
            FileExts.messageListeners.addMessageListener(window, 'loaded_utils', () => {
                FileExts.scripts.injectScript(chrome.runtime.getURL('inject/vue-wrapper.js'));
            }, true);
        }
    }

    _injectExtendedLog() {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL('toggle-switch.css');
        document.head.appendChild(link);
    }

    _setUpNowPlayingUI() {
        if(this.Courtroom.options['now-playing']) {
            const row = this.createRow(this.hilDiv);
            row.classList.add('hil-tab-row-now-playing');
            const span = document.createElement('span');
            span.innerHTML = 'Now Playing: …';
            row.appendChild(span);
        }
    }

    _setupTestimonyModeUI() {
        if(this.Courtroom.options['testimony-mode']) {
            const obj = new Testimony(this);
            obj.init();
        }
    }


    injectMdiIcons() {
        const link  = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css";
        document.head.appendChild(link);
    }

    uiInit() {
        let dotsStyling = 'display: flex; justify-content: flex-end; opacity: 70%; cursor: pointer;';
        this.hilToggleDots = FileExts.creation.createIcon('dots-horizontal', 28, dotsStyling);
        this.Courtroom.objection_lol_resources.CourtroomRightSide.appendChild(this.hilToggleDots);
        this.hilDiv = document.createElement("div");
        this.hilDiv.className = 'hil-hide';
        this.hilDiv.style.cssText = 'transform: translateY(-10px); padding: 0 8px 0px' + FileConstants.MISC.DEFAULT_TRANSITION;
        this.hilVisible = false;
        this.hilTabDiv = this.createRow(this.hilDiv);
        this.hilTabSeparator = document.createElement("hr");
        this.hilTabSeparator.className = 'hil-row-separator hil-hide';
        this.hilDiv.appendChild(this.hilTabSeparator);
        this.hilContentRow = this.createRow(this.hilDiv);
        this.hilContentRow.classList.add('hil-content-row');
        this.hilTabState = this.TabState.NONE;
        this.Courtroom.objection_lol_resources.CourtroomRightSide.appendChild(this.hilDiv);
    }

    setState(state) {
        if(this.hilTabState.onDisable) this.hilTabState.onDisable();
        if(this.hilTabState.contentDiv) {
            this.hilTabState.contentDiv.classList.add('hil-hide');
        }
        if(this.hilTabState.tabButton) this.hilTabState.tabButton.classList.remove('hil-btn-tab-active');
        this.hilTabState.enabled = false;
        this.hilTabState = state;
        if(this.hilTabState.onEnable) this.hilTabState.onEnable();
        if(this.hilTabState.contentDiv) {
            this.hilTabState.contentDiv.classList.remove('hil-hide');
        }
        if(this.hilTabState.tabButton) this.hilTabState.tabButton.classList.add('hil-btn-tab-active');
        this.hilTabState.enabled = true;
    }

    createTabDiv(state) {
        const div = document.createElement('div');
        div.className = 'hil-tab-content hil-hide';
        state.contentDiv = div;
        this.hilContentRow.appendChild(div);
        return div;
    }

    createTabButton(state, text, naming="unlabel-btn-element") {
        const button = FileExts.buttons.createButton(() => {
            if(!state.enabled) this.setState(state);
            else this.setState(this.TabState.NONE);
        }, text, '', 'flex: 1 1 auto; max-width: 10rem');


        naming === "unlabel-btn-element" ?
        console.warn("ERROR: Please you a valid class for styling!") : null;
        button.classList.add(naming);
        this.hilTabDiv.appendChild(button);
        state.tabButton = button;
        return button;
    }

    createRow(parent, transparent = false) {
        const div = document.createElement('div');
        div.className = 'hil-row';
        parent.appendChild(div);
        return div;
    }

    toggleHILDots() {
        this.hilVisible = !this.hilVisible;
        if(!this.hilVisible) {
            this.hilDiv.classList.add('hil-hide');
            this.hilDiv.style.transform = 'translateY(-10px)';
            return;
        }

        this.hilDiv.classList.remove('hil-hide');
        this.hilDiv.style.removeProperty('transform');
    }
}

