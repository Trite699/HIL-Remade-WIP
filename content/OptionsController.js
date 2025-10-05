"use strict";

const FileHelpers = helpersUtils;
const FileExts = extUtils;
const FileConstants = properties;

class CourtroomOptionsHandler {
  constructor(courtroom) {
    this.Courtroom = courtroom;
    this.helperToggle =  FileExts.creation.createIcon(
      'dots-horizontal', 28, 
      'opacity: 70%; margin-top: 15px; right: calc(-100% + 46px); cursor: pointer;'
    );
    this.helperDiv = document.createElement("div");
    this.helperVisible = false;
    this.UI_Element_Options = ['testimony-mode', 'now-playing', 'smart-tn', 'tts', 'quick-sfx'];
    this.TabState = {
      NONE: {
        enabled: true,
        onEnable: function(tabSeparator) {
          tabSeparator.classList.add('hil-hide');
        },
        onDisable: function(tabSeparator) {
          tabSeparator.classList.remove('hil-hide');
        }
      },
      TESTIMONY: {},
      TN: {},
      TTS: {}, 
      QUICKSFX: {}
    }
    this.tabRow = this.createRow(this.helperDiv);
    this.tabSeparator = document.createElement('hr');
    this.tabSeparator.className = 'hil-row-separator hil-hide';
    this.helperDiv.appendChild(this.tabSeparator);
        
    this.contentRow = this.createRow(this.helperDiv);
    this.contentRow.classList.add('hil-content-row')
    this.tabState = this.TabState.NONE;

    // Setting up link for icon
    const link  = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css";
    document.head.appendChild(link);
  }

  init() {
    let UIOptionsActivated = this.UI_Element_Options.some(sel => this.Courtroom.options[sel]);
    if(UIOptionsActivated) {
        //iconClass, fontPx = 24, styleText = '', classText = ''
        this.Courtroom.objection_lol_resources.CourtroomRightSide.appendChild(this.helperToggle);
        this.helperDiv.className = 'transform: translateY(-10px); padding: 0 8px 0px;' + FileConstants.MISC.DEFAULT_TRANSITION;
        this.Courtroom.objection_lol_resources.CourtroomRightSide.appendChild(this.helperDiv);
        
      this.helperToggle.addEventListener('click', () => {
        this.toggleHelperDiv();
      });

      this._setUpNowPlayingUI();
      this._setUpTestimonyModeUI();
    }
  }

  //Options UI functions

  _setUpNowPlayingUI() {
      if(this.Courtroom.options['now-playing']) {
        const row = this.createRow(this.contentRow);
        row.classList.add('hil-tab-row-now-playing');
        const span = document.createElement('span');
        span.innerHTML = 'Now Playing: …';
        row.appendChild(span);
      }
  }

  _setUpTestimonyModeUI() {
    if(this.Courtroom.options['testimony-mode']) {
        const testimony_properties = {
            statements: [],
            currentStatement: null,
            statementCache: {},
            lastStatementId: 0,
            auto: false,
            red: false, 
            crossExam: false,
            testimonyLocked: false,

            resetCache: function() {
                this.statementCache = {};
                this.lastStatementId = 0;
                window.postMessage(['clear_testimony_poses']);
            }
        }

        const testimonyTabDivider = this.createTabDiv(this.TabState.TESTIMONY);
        const testimonyRow = this.createRow(testimonyTabDivider);
        const testimonyArea = document.createElement('textarea');
        testimonyArea.className = 'hil-themed-text';
        testimonyArea.style.cssText = 'display: none; width: 100%; height: 600px; resize: none; overflow: auto; padding: 5px; margin: 0; border: #552a2e 1px solid;';
        testimonyArea.placeholder = "Paste your testimony here.\nSeparate statements with line breaks.";
        this.Courtroom.textArea.parentElement.appendChild(testimonyArea);

        const testimonyDiv = document.createElement('div');
        testimonyDiv.className = 'hil-themed-text';
        testimonyDiv.style.cssText = 'display: none; width: 100%; height: 600px; overflow: auto; padding: 5px 0px; margin: 0; border: #7f3e44 1px solid;';
        this.Courtroom.textArea.parentElement.appendChild(testimonyDiv);
        const primaryDiv = document.createElement('div');
        primaryDiv.style.cssText = 'display: none;' + HILRConstants.MISC.DEFAULT_TRANSITION;
    }
  }

  


  // Helper functions

  setState(state) {
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
    this.contentRow.appendChild(div);
    return div;
  }

  createTabButton(state, text) {
    const button = FileExts.buttons.createButton(() => {
    if (!this.state.enabled) this.setState(state);
      else setState(this.TabState.NONE);
    }, text, '', 'flex: 1 1 auto;max-width: 10rem;');
      this.tabRow.appendChild(button);
      this.state.tabButton = button;
      return button;
  }
}

/*

REFACTOR ALL OF IT
   if (showTutorial || options['testimony-mode'] || options['smart-tn'] || options['tts'] || options['quick-sfx']) {
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

        if (options['testimony-mode']) {
           

           
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
