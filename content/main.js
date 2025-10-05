"use strict";

const HILRExts = extUtils;
const HILRConstants = properties;
const SettingsController = CourtroomOptionsHandler;  

class Courtroom {

  constructor() {
    this.selection = document.getSelection();
    this.states = {};
    this.modifierKeys = {};
    this.theme;
    this.textArea;
    this.testifyToggle;
    this.options;
    this.wrapperLoaded;
    this.objection_lol_resources = {};
    this.optionsLoaded = new Promise((resolve) => {
      chrome.storage.local.get('options', (result) => {
        this.options = result.options || {};
        resolve(this.options);
      });
    });
    
    chrome.runtime.onMessage.addListener(async (request) => {
      if(request.messsage == "courtroom_state_loaded") {
        this._tryLoading(); 
      }
    });

    window.addEventListener("load", this.initializeHILR.bind(this));
  }

  _courtroomLocated() {
    let tabUrl = document.URL;
    result = () => tabUrl.split("courtroom/").length > 1;
    if (result) return true;
    return;
  }

  initializeHILR() {
     if(!this._tryLoading()) {
        new MutationObserver((mutations, observer) => {
          if(this._tryLoading()) {
              observer.disconnect();
          }
        }
      ).observe(document.getElementById("root"), {
        childList: true,
        subtree: true,
        once: true
      });
    }
  }

  waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const target = document.querySelector(selector);

      if(target) {
        return resolve(target);
      }

      const elementFinderObserver = new MutationObserver((mutations, observer) => {
        const targetScanNo = document.querySelector(selector);
          if(targetScanNo) {
            observer.disconnect();
            clearTimeout(timeoutId);
            return resolve(targetScanNo);
          }
      });

      const timeoutId = setTimeout(() => {
        console.log(`The current body: ${document.body.innerHTML}`)
        elementFinderObserver.disconnect();
        return reject(new Error(`Timeout (${timeout}ms) waiting for element: ${selector}`));
      }, timeout);

      elementFinderObserver.observe(this.objection_lol_resources.app, {
        childList: true,
        subtree: true
      });
    })
  }

  async _loadObjectionLolResources() {

    this.textArea = await this.waitForElement(".MuiInputBase-input.MuiOutlinedInput-input");
    this.textArea.classList.add("HILR-loaded"); 
    this.textValue = text => HILRExts.text.setValue(this.textArea, text);

    const resources = { 
      textButton: await this.waitForElement(".MuiButtonBase-root.MuiIconButton-root.MuiIconButton-colorInherit.MuiIconButton-sizeMedium.css-11rdika"),
      chatBox: await this.waitForElement(".MuiStack-root.css-ijtv1l"),
      chat: await this.waitForElement(".MuiList-root.MuiList-padding.css-f8flsj"),
      CourtroomWindow: await this.waitForElement(".MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.MuiGrid2-spacing-xs-1.css-3vuqz1"),
      CourtroomLeftSide: await this.waitForElement(".MuiStack-root.css-j7qwjs"),
      CourtroomRightSide: await this.waitForElement(".MuiGrid2-root.MuiGrid2-direction-xs-row.MuiGrid2-grid-xs-0.MuiGrid2-grid-md-5.MuiGrid2-grid-lg-5.css-wpmqq4"),
      CourtroomTabs: document.querySelector(".MuiTabs-list.MuiTabs-flexContainer.css-162tvoi") || document.querySelector(".MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1xpbjc9")
    }

    return resources;
  }
 
  _tryLoading() {
    if(document.title == "Create Courtroom") return; //new Error('This is not an error. This is just to abort javascript.');
    const isTextBoxLoaded = document.querySelector('.MuiInputBase-input.MuiOutlinedInput-input:not(.HILR-loaded)') && document.querySelector('.MuiInputBase-input.MuiOutlinedInput-input');
    if(!isTextBoxLoaded) return false;
    this.onLoad(); return true;
  }

  async onLoad() {
    if(!this._courtroomLocated) return;
    console.log("holdit.lol v0.7.5 beta - running onLoad()");
    this.objection_lol_resources.app = document.getElementById("root");
    Object.assign(this.objection_lol_resources, await this._loadObjectionLolResources());
    this._waitForTheme();
    document.body.classList.add("hil-themed");
    document.body.classList.add(this.theme);
    this.objection_lol_resources.textBackLog = [];
    this._isTextSendable();
    let Controller = new SettingsController(this);
    Controller.init();
  }

  _waitForTheme() {
    const themeButtonSelector = ".PrivateSwitchBase-input.MuiSwitch-input.css-j8yymo";
    
    const themeObserver = new MutationObserver((mutations, observer) => {
      const themeInput = document.querySelector(themeButtonSelector);
      if(themeInput) {
        observer.disconnect();
        this.objection_lol_resources.ThemeInput = themeInput;
        this.objection_lol_resources.ThemeInput.addEventListener("click", this._updateTheme.bind(this));
      }
    }).observe(this.objection_lol_resources.app, {
      childList: true,
      subtree: true
    });
  }

  sendText(text, persistent=false) {
    const oldValue = this.textArea.value;
    if(!this.objection_lol_resources.textButton.classList.contains("Mui-disabled")) {
      extUtils.text.setValue(this.textArea, text);
      this.objection_lol_resources.textButton.click();
      extUtils.text.setValue(this.textArea, oldValue);
    } else if(persistent) {
      this.objection_lol_resources.textBackLog.push(text);
    }
  }

  _isTextSendable() {
    let textButtonObserver = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (!this.objection_lol_resources.textButton.classList.contains('Mui-disabled') && this.objection_lol_resources.textBackLog.length > 0) {
                const text = this.objection_lol_resources.textBacklog.shift();
                this.sendText(text);
            }

        }
    }).observe(this.objection_lol_resources.textButton, { attributes: true, attributeFilter: ['class'] });
  }

  _getUserTheme() {
    if(this.objection_lol_resources.ThemeInput.checked == true) {
      this.theme = "theme--dark";
      return;
    }
    this.theme = "theme--light";
  }

  _updateTheme() {
    this._getUserTheme();
    this._themeSetup();
  }

  _themeSetup() {
    const elements = document.querySelectorAll(".hil-themed");
    for(let elem of elements) {
      elem.classList.remove("theme--dark");
      elem.classList.remove("theme--light"); 
      elem.classList.add(this.theme);
    }

    for(let element of document.querySelectorAll(".hil-themed-text")) {
      if(this.theme == "theme--dark") {
        element.style.color = HILRConstants.COLORS.BLACK;
        continue;
      }
      element.style.color = HILRConstants.COLORS.WHITE;
    }
  }    
}


let Court = new Courtroom();
