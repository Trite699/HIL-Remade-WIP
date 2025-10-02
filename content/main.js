"use strict";

const HILRHelpers = helpersUtils;
const HILRExts = extUtils;
const HILRConstants = properties;

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
    this.required_ol_elements = {};
    this.optionsLoaded = new Promise((resolve) => {
      chrome.storage.local.get('options', (result) => {
        this.options = result.options || {};
        resolve(this.options);
      });
    });
    
    chrome.runtime.onMessage.addListener(async (request) => {
      if(request.messsage == "courtroom_state_loaded") {
        await this._tryLoading(); 
      }
    });

    window.addEventListener("load", this._start_HILR.bind(this));
  }

  async _start_HILR() {
     if(!await this._tryLoading()) {
        new MutationObserver(async (mutations, observer) => {
          if(await this._tryLoading()) {
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



  async _tryLoading() {
    const isTextBoxLoaded = document.querySelector('.MuiInputBase-input.MuiOutlinedInput-input:not(.HILR-loaded)') && document.querySelector('.MuiInputBase-input.MuiOutlinedInput-input');
    if(!isTextBoxLoaded) return false;
    try {
      const options = await this.optionsLoaded;
      this.start(options);
      return true;
    } catch (error) {
      console.error("Failed to load the options of HILR: ", error);
      return true;
    }
  }

  start() {
    console.log("holdit.lol v0.7.5 beta - running start()");
    this.required_ol_elements = this._getResources();
    this._waitForTheme();
    document.body.classList.add("hil-themed");
    document.body.classList.add(this.theme);
    this.required_ol_elements.textBackLog = [];
    this._isTextSendable();
    this.setBaseUI = this.setupBase();
    this.init();
  }

  setupBase() {
    this.helperToggle;
    this.helperDiv;
    this.helperVisible = false;
    this.UI_Element_Options = ['testimony-mode', 'now-playing', 'smart-tn', 'tts', 'quick-sfx'];
    this.TabState = {
      NONE: {
        enabled: true,
        onEnable: function() {
          tabSeparator.classList.add('hilr-hide');
        },
        onDisable: function() {
          tabSeparator.classList.remove('hilr-hide');
        }
      },
      TESTIMONY: {},
      TN: {},
      TTS: {}, 
      QUICKSFX: {}
    }
  }
  
  init() {
      let UIOptionsActivated = this.UI_Element_Options.some(sel => this.options[sel]);
      if(UIOptionsActivated) {
        this.helperToggle = HILRExts.creation.createIcon('dots-horizontal', 28, 'opacity: 70%; margin-top: 15px; right: calc(-100% + 46px); cursor: pointer;');
        this.required_ol_elements.CourtroomBottomRow.appendChild(this.helperToggle);
        this.helperDiv = document.createElement('div');
        this.helperDiv.className = 'transform: translateY(-10px); padding: 0 8px 0px;' + HILRConstants.MISC.DEFAULT_TRANSITION;
        this.required_ol_elements.CourtroomBottomRow.appendChild(this.helperDiv);
          
        this.helperToggle.addEventListener('click', () => {
          this.toggleHelperDiv();
        });
  
        this._setUpNowPlaying();
      }
    }
  
    _setUpNowPlaying() {
        if(this.options['now-playing']) {
          const row = this.createRow(this.helperDiv);
          row.classList.add('hil-tab-row-now-playing');
          const span = document.createElement('span');
          span.innerHTML = 'Now Playing: …';
          row.appendChild(span);
        }
    }
   
    toggleHelperDiv() {
      this.helperVisible = !this.helperVisible;
      if(!this.helperVisible) {
        this.helperDiv.classList.add('hil-hide');
        this.helperDiv.style.transform = 'translateY(-10px)';
        return;
      }
      
      this.helperDiv.classList.remove('hil-hide');
      this.helperDiv.style.removeProperty('transform');
    }
  
    createRow(parent, transparent = false) {
      const div = document.createElement('div');
      div.className = "hil-row";
      parent.appendChild(div)
      return div;
    }
  
    createTabDiv(state) {
      const div = document.createElement('div');
      div.className = 'hil-tab-content hil-hide';
      state.contentDiv = div;
      contentRow.appendChild(div);
      return div;
    }
  
    createTabButton(state, text) {
      const button = HILRExts.createButton(function () {
        if (!state.enabled) setState(state);
          else setState(TabState.NONE);
        }, text, '', 'flex: 1 1 auto;max-width: 10rem;');
          tabRow.appendChild(button);
          state.tabButton = button;
          return button;
      }

  _waitForTheme() {
    const themeButtonSelector = ".PrivateSwitchBase-input.MuiSwitch-input.css-j8yymo";

    const themeObserver = new MutationObserver((mutations, observer) => {
      const themeInput = document.querySelector(themeButtonSelector);
      if(themeInput) {
        observer.disconnect();
        this.required_ol_elements.ThemeInput = themeInput;
        this.required_ol_elements.ThemeInput.addEventListener("click", this._updateTheme.bind(this));
      }
    }).observe(this.required_ol_elements.app, {
      childList: true,
      subtree: true
    });
  }

  sendText(text, persistent=false) {
    const oldValue = this.textArea.value;
    if(!this.required_ol_elements.textButton.classList.contains("Mui-disabled")) {
      extUtils.text.setValue(this.textArea, text);
      this.required_ol_elements.textButton.click();
      extUtils.text.setValue(this.textArea, oldValue);
    } else if(persistent) {
      this.required_ol_elements.textBackLog.push(text);
    }
  }

  _isTextSendable() {
    let textButtonObserver = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (!this.required_ol_elements.textButton.classList.contains('Mui-disabled') && this.required_ol_elements.textBackLog.length > 0) {
                const text = this.required_ol_elements.textBacklog.shift();
                this.sendText(text);
            }

        }
    }).observe(this.required_ol_elements.textButton, { attributes: true, attributeFilter: ['class'] });
  }

  _getUserTheme() {
    if(this.required_ol_elements.ThemeInput.checked == true) {
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

  _getResources() {
    this.textArea = document.querySelector(".MuiInputBase-input.MuiOutlinedInput-input");
    this.textArea.classList.add("HILR-loaded"); 

    return { 
      app: document.getElementById("root"),
      textValue: text => HILRExts.text.setValue(this.textArea, text),
      textButton: document.querySelector(".MuiButtonBase-root.MuiIconButton-root.MuiIconButton-colorInherit.MuiIconButton-sizeMedium.css-11rdika"),
      chatBox: document.querySelector(".MuiStack-root.css-ijtv1l"),
      chat: document.querySelector(".MuiList-root.MuiList-padding.css-f8flsj"),
      CourtroomWindow: document.querySelector(".MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.MuiGrid2-spacing-xs-1.css-3vuqz1"),
      CourtroomTopRow: document.querySelectorAll(".MuiStack-root.css-j7qwjs")[1],
      CourtroomBottomRow: document.querySelector(".MuiStack-root.css-c6l652"),
      CourtroomTabs: document.querySelector(".MuiTabs-list.MuiTabs-flexContainer.css-162tvoi") || document.querySelector(".MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1xpbjc9")
    };
  }
}



async function main() {
  let userInstanceCourtroom = new Courtroom();
}

main();
    
/*

REFACTOR ALL OF IT
   if (showTutorial || options['testimony-mode'] || options['now-playing'] || options['smart-tn'] || options['tts'] || options['quick-sfx']) {
        if (showTutorial) {
            if (!options['seen-tutorial']) {
                toggleHelperDiv(true);
            }

            const div = document.createElement('div');
            div.style.cssText = 'width: 60%; text-align: center; margin: 0 auto; font-weight: 300;';

            const img = document.createElement('img');
            img.src = 'https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Misc/hold%20it.lol/holdit.png';
            img.style.width = '100%';
            div.appendChild(img);

            if (!options['seen-tutorial']) div.innerHTML += '<span style="font-weight: 400;">Thank you for installing Hold It.lol!</span><br>';
            div.innerHTML += '<span>Click on the </span><img src="https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Misc/hold%20it.lol/icon32.png" style="height: 24px;vertical-align: middle;user-select: all;"><span> icon in the </span><span style="font-weight: 400;">top-right of your browser</span><span> to check out your </span><span style="font-weight: 400;">Options</span><span>.</span>'

            helperDiv.appendChild(div);
        };

        
                const tabRow = createRow(helperDiv);

        const tabSeparator = document.createElement('hr');
        tabSeparator.className = 'hil-row-separator hil-hide';
        helperDiv.appendChild(tabSeparator);
        
        const contentRow = createRow(helperDiv);
        contentRow.classList.add('hil-content-row')
        let tabState = TabState.NONE;
        function setState(state) {
            if (tabState.onDisable) tabState.onDisable();
            if (tabState.contentDiv) {
                tabState.contentDiv.classList.add('hil-hide');
            }
            if (tabState.tabButton) tabState.tabButton.classList.remove('hil-btn-tab-active');
            tabState.enabled = false;
            tabState = state;
            if (tabState.onEnable) tabState.onEnable();
            if (tabState.contentDiv) {
                tabState.contentDiv.classList.remove('hil-hide');
            }
            if (tabState.tabButton) tabState.tabButton.classList.add('hil-btn-tab-active');
            tabState.enabled = true;
        }
        
        if (options['testimony-mode']) {
            const tabDiv = createTabDiv(TabState.TESTIMONY);
            const testimonyRow = createRow(tabDiv);

            const testimonyArea = document.createElement('textarea');
            testimonyArea.className = 'hil-themed-text';
            testimonyArea.style.cssText = 'display: none; width: 100%; height: 600px; resize: none; overflow: auto; padding: 5px; margin: 0; border: #552a2e 1px solid;';
            testimonyArea.placeholder = "Paste your testimony here.\nSeparate statements with line breaks.";
            textArea.parentElement.appendChild(testimonyArea);

            const testimonyDiv = document.createElement('div');
            testimonyDiv.className = 'hil-themed-text';
            testimonyDiv.style.cssText = 'display: none; width: 100%; height: 600px; overflow: auto; padding: 5px 0px; margin: 0; border: #7f3e44 1px solid;';
            textArea.parentElement.appendChild(testimonyDiv);

            let statements;
            let currentStatement;
            let statementCache = {};
            let lastStatementId = 0;
            function resetCache() {
                statementCache = {};
                lastStatementId = 0;
                window.postMessage(['clear_testimony_poses']);
            }
            
            let auto = false;
            let red = false;
            let crossExam = false;

            const primaryDiv = document.createElement('div');
            primaryDiv.style.cssText = 'display: none;' + DEFAULT_TRANSITION;

            let testimonyLocked = false;
            const lockTestimony = primaryButton(function () {
                if (!testimonyLocked && testimonyArea.value == "") return;
                testimonyLocked = !testimonyLocked;
                if (testimonyLocked) {

                    lockTestimony.firstElementChild.classList.remove('mdi-check');
                    lockTestimony.firstElementChild.classList.add('mdi-close');
                    primaryDiv.style.display = 'block';

                    testimonyArea.value = testimonyArea.value.trim();
                    currentStatement = undefined;
                    statements = testimonyArea.value.split('\n').filter(e => e.trim());

                    let toResetCache = true;
                    for (let statement of statements) {
                        if (!(statement in statementCache)) continue;
                        toResetCache = false;
                        break;
                    }
                    if (toResetCache) resetCache();

                    testimonyDiv.textContent = '';
                    for (let i = 0; i < statements.length; i++) {
                        const statement = statements[i];

                        const div = document.createElement('div');
                        div.style.cssText = 'position: relative; padding: 0px 0px 16px 5px; cursor: pointer; margin-bottom: 9px;' + DEFAULT_TRANSITION;
                        div.dataset.statement = i;

                        div.addEventListener('click', function () {
                            if (div.querySelector(':scope .pose-message:hover')) return;
                            toStatement(i);
                        });

                        div.appendChild(document.createElement('span'));
                        div.lastElementChild.innerText = statement;

                        const pose = document.createElement('div');
                        pose.className = 'hil-themed pose-message v-messages v-messages__message ' + theme;
                        pose.style.cssText = 'position: absolute;';
                        if (statement in statementCache) {
                            let poseName = statementCache[statement].poseName;
                            if (!poseName) poseName = UNDEFINED_POSE_NAME;
                            pose.innerText = poseName;
                            pose.dataset.pose = poseName;
                        }
                        pose.addEventListener('mouseenter', () => { if (pose.dataset.pose) pose.innerText = 'Click to clear pose'; });
                        pose.addEventListener('mouseleave', () => { if (pose.dataset.pose) pose.innerText = pose.dataset.pose; });
                        pose.addEventListener('click', () => {
                            pose.dataset.pose = '';
                            pose.innerText = '';
                            if (statementCache[statement] === undefined) return;
                            delete statementCache[statement].poseName;
                            window.postMessage([
                                'clear_testimony_pose',
                                statementCache[statement].id,
                            ]);
                        });
                        div.appendChild(pose);

                        testimonyDiv.appendChild(div);
                        setTimeout(function () {
                            div.style.marginBottom = '20px';
                            div.style.padding = '5px';
                        }, 1);
                    }

                    if (red && testimonyDiv.childElementCount != 0) {
                        testimonyDiv.firstElementChild.firstElementChild.style.color = '#f00';
                        testimonyDiv.lastElementChild.firstElementChild.style.color = '#f00';
                    }

                    testimonyArea.style.display = 'none';
                    testimonyDiv.style.display = 'block';

                } else {

                    lockTestimony.firstElementChild.classList.add('mdi-check');
                    lockTestimony.firstElementChild.classList.remove('mdi-close');
                    primaryDiv.style.display = 'none';

                    testimonyArea.style.display = 'block';
                    testimonyDiv.style.display = 'none';

                }
            }, '', 'display: none; background-color: #7f3e44 !important; margin: 0 4px;', createIcon('check'));
            textButton.parentElement.parentElement.insertBefore(lockTestimony, textButton.parentElement);

            const buttonNextStatement = primaryButton(undefined, '', 'background-color: #552a2e !important; margin-left: 4px;', createIcon('send'));
            const buttonPrevStatement = primaryButton(undefined, '', 'background-color: #552a2e !important; margin-left: 4px;', createIcon('send', 24, 'transform: scaleX(-1);'));
            primaryDiv.appendChild(buttonPrevStatement);
            primaryDiv.appendChild(buttonNextStatement);

            textButton.parentElement.parentElement.appendChild(primaryDiv);


            TabState.TESTIMONY.onEnable = function() {
                textArea.style.display = 'none';

                textButton.parentElement.style.display = 'none';
                lockTestimony.style.display = 'flex';
                if (testimonyLocked) {
                    primaryDiv.style.display = 'flex';
                    testimonyDiv.style.display = 'block';
                } else {
                    testimonyArea.style.display = 'block';
                }

                if (testifyToggle && !testifyToggle.classList.contains('v-input--is-label-active')) testifyToggle.querySelector('.v-input__slot').click();
            }
            TabState.TESTIMONY.onDisable = function() {
                testimonyArea.style.display = 'none';
                testimonyDiv.style.display = 'none';
                textArea.style.display = 'block';

                textButton.parentElement.style.display = 'block';
                lockTestimony.style.display = 'none';
                primaryDiv.style.display = 'none';

                if (testifyToggle && testifyToggle.classList.contains('v-input--is-label-active')) testifyToggle.querySelector('.v-input__slot').click();
            }
            createTabButton(TabState.TESTIMONY, 'Testimony Mode');


            const inputRow = createRow(tabDiv);
            function testimonyInput(id, placeholder, onchange = undefined) {
                const input = document.createElement('input');
                input.id = id;
                input.autocomplete = 'on';
                input.className = 'hil-themed hil-row-textbox v-size--default v-sheet--outlined hil-themed-text ' + theme;
                input.style.width = '10rem';
                input.placeholder = placeholder;
        
                input.addEventListener('click', () => input.setSelectionRange(0, input.value.length));
                if (onchange) input.addEventListener('change', onchange);
        
                inputRow.appendChild(input);
                return input;
            }
            const musicInput = testimonyInput('hil-tm-music', 'Testimony music', function() {
                window.postMessage(['set_socket_state', {
                    [ 'testimony-music' ]: inputToTag(musicInput.value, 'bgm')
                }]);
            });
            const selectInput = testimonyInput('hil-tm-select', 'Cross-exam click sound');

            function inputToTag(value, tagName) {
                const match = value.match(/[0-9]+/g)
                if (match && ('[#' + tagName + '0]').includes(value.replaceAll(/[0-9]+/g, '0'))) {
                    const id = match[0];
                    return '[#' + tagName + id + ']';
                } else {
                    return '';
                }
            }

            testimonyRow.appendChild(iconToggleButton(function() {
                red = !red;
                if (testimonyDiv.childElementCount > 0) {
                    if (red) {
                        testimonyDiv.firstElementChild.firstElementChild.style.color = '#f00';
                        testimonyDiv.lastElementChild.firstElementChild.style.color = '#f00';
                    } else {
                        testimonyDiv.firstElementChild.firstElementChild.style.removeProperty('color');
                        testimonyDiv.lastElementChild.firstElementChild.style.removeProperty('color');
                    }
                }
                return red;
            }, 'Red Beginning/End', 'hil-testiony-btn'));
            testimonyRow.appendChild(iconToggleButton(function() { return crossExam = !crossExam; }, 'Cross-exam mode', 'hil-testiony-btn'));
            testimonyRow.appendChild(iconToggleButton(function() { return auto = !auto; }, 'Use < > from chat', 'hil-testiony-btn'));


            function setElemPoseName(statementElem, name) {
                statementElem.querySelector('div.pose-message').innerText = name;
                statementElem.querySelector('div.pose-message').dataset.pose = name;
            }

            function toStatement(statement) {
                let statementElem;
                if (currentStatement != statement) {
                    currentStatement = statement;

                    let added = false;
                    let removed = false;
                    for (let elem of testimonyDiv.children) {
                        if (!removed && elem.style.backgroundColor != '') {
                            elem.style.removeProperty('background-color');
                            removed = true;
                        } else if (!added && elem.dataset.statement == String(currentStatement)) {
                            elem.style.backgroundColor = '#552a2e';
                            statementElem = elem;
                            added = true;
                        }
                        if (removed && added) break;
                    }
                } else {
                    for (let elem of testimonyDiv.children) {
                        if (elem.dataset.statement != String(currentStatement)) continue;
                        statementElem = elem;
                        break;
                    }
                }

                const statementText = statements[statement];
                const music = inputToTag(musicInput.value, 'bgm');
                const continueSound = inputToTag(selectInput.value, 'bgs');

                let text = statementText;

                if (red && (statement == 0 || statement == statements.length - 1)) {
                    text = '[##nt][##ct][#/r]' + text + '[/#]';
                } else if (crossExam) {
                    text = text.replaceAll(/\[#.*?\]/g, '');
                    text = text.replaceAll('[/#]', '');
                    text = continueSound + '[##ce][##dd][#ts10][#/g]' + text + '[/#]';
                }

                if (!crossExam && statement == statements.length - 1) {
                    if (red) {
                        text = TAG_MUSIC_FADE_OUT + text;
                    } else {
                        text = text + TAG_MUSIC_FADE_OUT;
                    }
                } else if (!crossExam && red && statement == 0 && music) {
                    text = '[#bgms]' + text;
                }

                if (statementCache[statementText] === undefined) {
                    statementCache[statementText] = {
                        id: lastStatementId
                    }
                    lastStatementId += 1;
                } else if (statementCache[statementText].poseName) {
                    setElemPoseName(statementElem, statementCache[statementText].poseName);
                }

                text = '[##tmid' + statementCache[statementText].id + ']' + text;
                sendText(text);
            }
            
            addMessageListener(window, 'set_statement_pose_name', function(data) {
                const statementText = Object.keys(statementCache).find(text => statementCache[text].id === data.id);
                const statementObj = statementCache[statementText];
                statementObj.poseName = data.name;

                if (!testimonyLocked) return;

                for (let statementElem of testimonyDiv.children) {
                    if (statementElem.querySelector('span').innerText !== statementText) continue;
                    setElemPoseName(statementElem, data.name);
                }   
            });

            function loopTo(statement) { toStatement(statement); }

            function nextStatement() {
                const edges = crossExam && red && statements.length > 1;
                if (currentStatement == undefined) {
                    toStatement(0);
                } else if (currentStatement >= statements.length - (edges ? 2 : 1)) {
                    loopTo(edges ? 1 : 0);
                } else {
                    toStatement(currentStatement + 1);
                }
            }
            function prevStatement() {
                const edges = crossExam && red && statements.length > 1;
                if (currentStatement == undefined) {
                    toStatement(statements.length - 1);
                } else if (currentStatement <= edges ? 1 : 0) {
                    loopTo(statements.length - (edges ? 2 : 1));
                } else {
                    toStatement(currentStatement - 1);
                }
            }

            buttonNextStatement.addEventListener('click', nextStatement);
            buttonPrevStatement.addEventListener('click', prevStatement);

            let characterObserver = new MutationObserver(function (mutations) {
                for (let mutation of mutations) {
                    if (mutation.attributeName != "style" || mutation.oldValue == undefined) continue;

                    const oldIcon = mutation.oldValue.match(/background-image: (url\(\".*?\"\));/)[1];
                    const newIcon = mutation.target.style.backgroundImage;
                    if (oldIcon !== newIcon) {
                        resetCache();
                        for (let elem of document.querySelectorAll('.pose-message')) {
                            elem.dataset.pose = '';
                            elem.innerText = '';
                        }
                    };
                }
            });

            new MutationObserver(function (mutations, observer) {
                for (let mutation of mutations) {
                    for (let node of mutation.addedNodes) {
                        if (!node.matches('div.v-image__image[style*="background-image:"]')) continue;

                        characterObserver.observe(node, {
                            attributes: true,
                            attributeOldValue: true
                        });

                        observer.disconnect();
                    }
                }
            }).observe(document.querySelector('div.col-sm-3.col-2 div.icon-character'), { childList: true });

            states.testimonyArrow = function(arrow) {
                if (testimonyLocked && auto) {
                    if (arrow == '>') nextStatement();
                    else if (arrow == '<') prevStatement();
                }
            }
            states.testimonyIndex = function(statement) {
                if (testimonyLocked && auto) {
                    let statementI = statement - 1;
                    if (red) statementI += 1;
                    let max = statements.length;
                    if (red) max -= 1;
                    if (statementI < 0 || statementI >= max) return;
                    toStatement(statementI);
                }
            }

            addMessageListener(window, 'plain_message', function(data) {
                if (testRegex(data.text, '[> ]*') && data.text.indexOf('>') !== -1) states.testimonyArrow('>');
                else if (testRegex(data.text, '[< ]*') && data.text.indexOf('<') !== -1) states.testimonyArrow('<');
                else if (testRegex(data.text, '<[0-9]*?>')) states.testimonyIndex(Number(data.text.slice(1, -1)));
            })    
        }
*/
