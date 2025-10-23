"use strict";

const HILRExts = extUtils;
const HILRHelpers = helpersUtils;
const HILRConstants = properties;
const SettingsController = CourtroomOptionsHandler; 

class Courtroom {

  constructor() {
    this.selection = document.getSelection();
    this.states = {};
    this.modifierKeys = {};
    this.testifyToggle;
    this.options;
    this.wrapperLoaded;
    this.objection_lol_resources = {
      app: document.querySelector("#root"),
      textBackLog: []
    };
    this.optionsLoaded = new Promise((resolve) => {
      chrome.storage.local.get('options', (result) => {
        this.options = result.options || {};
        resolve();
      });
    });
    
    chrome.runtime.onMessage.addListener((request) => {
      const [ action ] = request;
      if(action == "courtroom_state_loaded") {
         this.tryLoading(); 
      }
    });

    window.addEventListener("load", async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.initializeHILR();
    });
  }

  initializeHILR() {
    if(!this.tryLoading()) {
        new MutationObserver((mutations, observer) => {
          if(this.tryLoading()) {
            observer.disconnect();
          }
        }
      ).observe(this.objection_lol_resources.app, {
        childList: true,
        subtree: true,
      });
    }
  }

  async _loadObjectionLolResources() {
    const app = this.objection_lol_resources.app;
    const [textArea, textButton, chatBox, chat, CourtroomWindow, CourtroomLeftSide, CourtroomRightSide] = await Promise.all([
      HILRHelpers.waitForElement(".MuiInputBase-input.MuiOutlinedInput-input", app),
      HILRHelpers.waitForElement(".MuiButtonBase-root.MuiIconButton-root.MuiIconButton-colorInherit.MuiIconButton-sizeMedium.css-11rdika", app),
      HILRHelpers.waitForElement(".MuiStack-root.css-ijtv1l", app),
      HILRHelpers.waitForElement(".MuiList-root.MuiList-padding.css-f8flsj", app),
      HILRHelpers.waitForElement(".MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.MuiGrid2-spacing-xs-1.css-3vuqz1", app),
      HILRHelpers.waitForElement(".MuiStack-root.css-j7qwjs", app),
      HILRHelpers.waitForElement(".MuiGrid2-root.MuiGrid2-direction-xs-row.MuiGrid2-grid-xs-0.MuiGrid2-grid-md-5.MuiGrid2-grid-lg-5.css-wpmqq4", app)
    ]);
    
    const themeData = HILRExts.theme.getTheme();
    this.theme = themeData.theme;
    themeData.themeInput.addEventListener('click', this.applyTheme.bind(this));

    const requiredResources = [textArea, textButton, chatBox, chat, CourtroomWindow, CourtroomLeftSide, CourtroomRightSide];
    const results = requiredResources.every(elem => elem);
    if(!results) throw new Error("there was an error with the ui");
    let textValue = text => HILRExts.text.setValue(textArea, text);
    document.body.classList.add("hil-themed");
    this.applyTheme();
    document.body.classList.add(this.theme);
    textArea.classList.add("HILR-loaded");

    Object.assign(this.objection_lol_resources, {
      textArea, 
      textButton, 
      chatBox, 
      chat,
      CourtroomWindow,
      CourtroomLeftSide,
      CourtroomRightSide,
      textValue,
    });
  }

  tryLoading() {
    const hilNotStart = document.querySelector(".MuiInputBase-input.MuiOutlinedInput-input:not(.HILR-loaded)");
    if(!hilNotStart) return false;
    this.optionsLoaded.then(() => {
      this.onLoad();
    });
    return true;
  }

  onLoad() {
    if(!HILRHelpers.inCourtroom()) return;
    console.log("holdit.lol v0.7.5 beta - running onLoad()");
    this._loadObjectionLolResources().then(() => {
      this.processTextBackLog();
      let Controller = new CourtroomOptionsHandler(this);
      Controller.init();
    });
  }

  sendText(text, persistent=false) {
    const oldValue = this.objection_lol_resources.textArea.value;
    if(!this.objection_lol_resources.textButton.classList.contains("Mui-disabled")) {
      HILRExts.text.setValue(this.objection_lol_resources.textArea, text);
      this.objection_lol_resources.textButton.click();
      HILRExts.text.setValue(this.objection_lol_resources.textArea, oldValue);
    } else if(persistent) {
      this.objection_lol_resources.textBackLog.push(text);
    }
  }

  processTextBackLog() {
    let textButtonObs = new MutationObserver((mutations) => {
      const disabled = this.objection_lol_resources.textButton.classList.contains('Mui-disabled');
      const hasMoreToSay = this.objection_lol_resources.textBackLog.length > 0;
      if(!disabled && hasMoreToSay) {
        const text = this.objection_lol_resources.textBackLog.shift();
        this.sendText(text);
      }
    });

    textButtonObs.observe(this.objection_lol_resources.textButton, { attributes: true, attributeFilter: ['class'] });
  }

  applyTheme() {
    Array.from(document.querySelectorAll('.hil-themed'))
    .forEach(elem => {
      elem.classList.remove("theme--dark", "theme--light");
      elem.classList.add(this.objection_lol_resources.theme);
    });

    Array.from(document.querySelectorAll('.hil-themed-text'))
    .forEach(elem => {
      this.objection_lol_resources.theme === "theme--dark" ?
      elem.style.color = HILRConstants.COLORS.BLACK :
      elem.style.color = HILRConstants.COLORS.WHITE;
    });
  }    
}

let MainProcess = new Courtroom();
