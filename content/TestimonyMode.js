
const stylers = properties;
const externals = extUtils;

class Testimony {
  static START_WITHOUT_TITLE = 0;
  static START_WITH_TITLE = 1;



  constructor(optsController) {
    this.optionsController = optsController;
    this.court = this.optionsController.Courtroom;
    this.statements;
    this.currentStatement;
    this.statementCache = {};
    this.lastStatementId = 0;
    this.auto = false;
    this.red = false;
    this.crossExam = false;
    this.testimonyLocked = false;
  }

  init() {
    // Step 1: Create UI containers and elements
    this.TestimonyTabDiv = this.optionsController.createTabDiv(this.optionsController.TabState.TESTIMONY);
    this.TestimonyRow = this.optionsController.createRow(this.TestimonyTabDiv); // ✅ Keeps up with old code

    // Create textarea for testimony input
    this.TestimonyArea = document.createElement('textarea');
    this.TestimonyArea.className = 'hil-themed-text';
    this.TestimonyArea.style.cssText = properties.STYLES.TESTIMONY_BOX;
    this.TestimonyArea.placeholder = "Paste your testimony here.\nSeparate statements with line breaks.";

    // Create div for locked testimony display
    this.TestimonyDiv = document.createElement('div');
    this.TestimonyDiv.className = 'hil-themed-text';
    this.TestimonyDiv.style.cssText = 'display: none; width: 100%; height: 600px; overflow: auto; padding: 5px 0px; margin: 0; border: #7f3e44 1px solid;';

    // Create primary div for navigation buttons
    this.primeDiv = document.createElement('div');
    this.primeDiv.style.cssText = 'display: none;' + stylers.MISC.DEFAULT_TRANSITION; //✅

    if(this.court.textArea) {
      this.court.textArea.parentElement.appendChild(this.TestimonyArea);
      this.court.textArea.parentElement.appendChild(this.TestimonyDiv);
    } else {
      throw Error("We cannot render these elements since the textArea failed to be found, please remake a function to check all elements before startup");
    }

    // Step 2: Create testimony lock functionality
    this.lockTestimony = externals.buttons.primaryButton(
      this.setupLockButton.bind(this), '',
      'display: none; background-color: #7f3e44 !important; margin: 0 4px;', 
      externals.creation.createIcon('check')
    );
    this.court.objection_lol_resources.textButton.parentElement.parentElement.insertBefore(this.lockTestimony, this.court.objection_lol_resources.textButton.parentElement);
    // ✅

    // Step 3: Set up statement navigation
    this.buttonNextStatement = externals.buttons.primaryButton(
      undefined, '', 
      'background-color: #552a2e !important; margin-left: 4px;', 
      externals.creation.createIcon('send')
    );
    this.buttonPrevStatement = externals.buttons.primaryButton(
      undefined, '', 
      'background-color: #552a2e !important; margin-left: 4px;', 
      externals.creation.createIcon('send', 24, 'transform: scaleX(-1);')
    );

    this.primeDiv.appendChild(this.buttonPrevStatement);
    this.primeDiv.appendChild(this.buttonNextStatement); //✅
    
    this.court.objection_lol_resources.textButton.parentElement.parentElement.appendChild(this.primeDiv);
    // ✅
    
    // Step 4: Configure tab state handlers
    this.optionsController.TabState.TESTIMONY.onEnable = this.onEnable.bind(this);
    this.optionsController.TabState.TESTIMONY.onDisable = this.onDisable.bind(this);
    this.TestimonyModeButton = this.optionsController.createTabButton(this.optionsController.TabState.TESTIMONY, 'Testimony Mode', "hil-tm-btnctrl");
    this.TestimonyInputRow = this.optionsController.createRow(this.TestimonyTabDiv); //✅
    // Step 5: Create input fields
    this.musicInput = this.testimonyInput('hil-tm-music', 'Testimony Music', () => {
      window.postMessage(['set_socket_state', {
        [ 'testimony-music' ]: this.inputToTag(this.musicInput.value, 'bgm')
      }]);
    });
    
    this.selectInput = this.testimonyInput('hil-tm-select', 'Cross-exam click sound');
    // ✅

    // Step 6: Add toggle buttons
    this.TestimonyRow.appendChild(externals.buttons.iconToggleButton(
      () => { 
        this.red = !this.red;
        this._updateTestimonyRedStyles();
        return this.red;
      }, 
      'Red Beginning/End', 
      'hil-testimony-btn'
    ));
    
    this.TestimonyRow.appendChild(externals.buttons.iconToggleButton(
      () => { return this.crossExam = !this.crossExam; }, 
      'Cross-exam mode', 
      'hil-testimony-btn'
    ));
    
    this.TestimonyRow.appendChild(externals.buttons.iconToggleButton(
      () => { return this.auto = !this.auto; }, 
      'Use < > from chat', 
      'hil-testimony-btn'
    )); // ✅

    this.getPoses();

    this.buttonNextStatement.addEventListener('click', this.nextStatement.bind(this));
    this.buttonPrevStatement.addEventListener('click', this.prevStatement.bind(this));
    // ✅
    // Step 7: Set up message listeners
    //this.getCharacterWatcher();

    



    // Step 8: Set up pose system listeners
    

    // Step 9: Initialize character observer

    // Step 10: Register global state handlers
    this.addListenerMovements(); //✅
    console.log("Testimony Mode Setup Complete");
  }

  _setTestimonyLock() {
    if (!this.testimonyLocked && this.TestimonyArea.value == "") return;
    this.testimonyLocked = !this.testimonyLocked;
  }

  shouldClearLockedTestimony() {
    let isNewTestimony = !this.statements.some(
      statement => statement in this.statementCache
    );
    if (!isNewTestimony) this.resetCache();
  }

  setTestimony() {
    this.TestimonyArea.value = this.TestimonyArea.value.trim();
    this.currentStatement = undefined;
    this.statements = this.TestimonyArea.value.split('\n').filter(
      e => e.trim());
  }

  lockUISetup() {
    this.lockTestimony.firstElementChild.classList.replace('mdi-check', 'mdi-close');
    this.primeDiv.style.display = 'block';
    this.TestimonyDiv.textContent = undefined;
  }

  unlockUISetup() {
    this.lockTestimony.firstElementChild.classList.replace('mdi-close', 'mdi-check');
    this.primeDiv.style.display = 'none';
    this.TestimonyArea.style.display = 'block';
    this.TestimonyDiv.style.display = 'none';
  }

  setupLockButton() {
    this._setTestimonyLock();
    if(this.testimonyLocked) {
      this.lockUISetup();
      this.setTestimony();
      this.shouldClearLockedTestimony();
      for(let [testimonyLinePos, statement] of this.statements.entries()) {
        this.setupStatementDiv(statement, testimonyLinePos);
      }
      this.finalizeLockSetupStyling();
    } else {
      this.unlockUISetup();
    }
  }

  setupStatementDiv(line, iteratorIndex) {
    const div = document.createElement('div');
    div.style.cssText = 'position: relative; padding: 0px 0px 16px 5px; cursor: pointer; margin-bottom: 9px;' + stylers.MISC.DEFAULT_TRANSITION;
    div.dataset.statement = iteratorIndex;
    div.addEventListener('click', () => {
      if (div.querySelector(':scope .pose-message:hover')) return;
      this.toStatement(iteratorIndex);
    });

    div.appendChild(document.createElement('span'));
    div.lastElementChild.innerText = line;
    this.setupMessagePoseManager(line, div);
    this.TestimonyDiv.appendChild(div);
    setTimeout(function() {
      div.style.marginBottom = '20px';
      div.style.padding = '5px';
    }, 1);
  }

  setupMessagePoseManager(statement, div) {
    const pose = document.createElement('div');
    pose.className = 'hil-themed pose-message v-messages v-messages__message ' + this.court.theme;
    pose.style.cssText = 'position: absolute;';
    if (statement in this.statementCache) {
      let poseName = this.statementCache[statement].poseName;
      if (!poseName) poseName = UNDEFINED_POSE_NAME;
      pose.innerText = poseName;
      pose.dataset.pose = poseName;
    }
    pose.addEventListener('mouseenter', () => { if (pose.dataset.pose) pose.innerText = 'Click to clear pose'; });
    pose.addEventListener('mouseleave', () => { if (pose.dataset.pose) pose.innerText = pose.dataset.pose; });
    pose.addEventListener('click', () => {
      pose.dataset.pose = '';
      pose.innerText = '';
      if (this.statementCache[statement] === undefined) return;
      delete this.statementCache[statement].poseName;
      window.postMessage(['clear_testimony_pose',
        this.statementCache[statement].id,
      ]);
    });
    div.appendChild(pose);
  }
  
  finalizeLockSetupStyling() {
    if (this.red && this.TestimonyDiv.childElementCount != 0) {
      this.TestimonyDiv.firstElementChild.firstElementChild.style.color = '#f00';
      this.TestimonyDiv.lastElementChild.firstElementChild.style.color = '#f00';
    }

    this.TestimonyArea.style.display = 'none';
    this.TestimonyDiv.style.display = 'block';
  }

  inputToTag(value, tagName) {
    const match = value.match(/[0-9]+/g)
    if (match && ('[#' + tagName + '0]').includes(value.replaceAll(/[0-9]+/g, '0'))) {
        const id = match[0];
        return '[#' + tagName + id + ']';
    } else {
        return '';
    }
  }

  resetCache() {
    this.statementCache = {};
    this.lastStatementId = 0;
    window.postMessage(['clear_testimony_poses']);
  }

  testimonyInput(id, placeholder, onchange = undefined) {
    const input = document.createElement('input');
    input.id = id;
    input.autocomplete = 'on';
    input.className = 'hil-themed hil-row-textbox v-size--default v-sheet--outlined hil-themed-text ' + this.court.theme;
    input.style.width = '10rem';
    input.placeholder = placeholder;
    input.addEventListener('click', () => input.setSelectionRange(0, input.value.length));
    if (onchange) input.addEventListener('change', onchange);
    this.TestimonyInputRow.appendChild(input);
    return input;
  }

  onEnable() {
    this.court.textArea.style.display = 'none';
    this.court.objection_lol_resources.textButton.parentElement.style.display = 'none';
    this.lockTestimony.style.display = 'flex';
    if (this.testimonyLocked) {
        this.primeDiv.style.display = 'flex';
        this.TestimonyDiv.style.display = 'block';
    } else {
        this.TestimonyArea.style.display = 'block';
    }

  }

  onDisable() {
    this.TestimonyArea.style.display = 'none';
    this.TestimonyDiv.style.display = 'none';
    this.court.textArea.style.display = 'block';

    this.court.objection_lol_resources.textButton.parentElement.style.display = 'block';
    this.lockTestimony.style.display = 'none';
    this.primeDiv.style.display = 'none'; 
  }

  testimonyArrow(arrow) {
    if(!this.testimonyLocked && !this.auto) return;
    
    if (arrow === '>') this.nextStatement();
    else if (arrow === '<') this.prevStatement();
  }

  testimonyPosition(statement) {
    if (this.testimonyLocked && this.auto) {
      let statementI = statement - 1;
      if (this.red) statementI += 1;
      let max = this.statements.length;
      if (this.red) max -= 1;
      if (statementI < 0 || statementI >= max) return;
      this.toStatement(statementI);
    }
  }

  setElemPoseName(statementElem, name) {
    statementElem.querySelector('div.pose-message').innerText = name;
    statementElem.querySelector('div.pose-message').dataset.pose = name;
  }


  nextStatement() {
    const hasTitledTestimony = this.crossExam && this.red && this.statements.length > 1;
    const reachedLastLine = this.currentStatement >= this.statements.length - (hasTitledTestimony ? 2 : 1);

    if (this.currentStatement == undefined) {
        this.toStatement(0);
    } else if (reachedLastLine) {
        this.loopTo(hasTitledTestimony ? Testimony.START_WITH_TITLE : Testimony.START_WITHOUT_TITLE);
    } else {
        this.toStatement(this.currentStatement + 1);
    }
  }

  prevStatement() {
    const edges = this.crossExam && this.red && this.statements.length > 1;
    if (this.currentStatement == undefined) {
        this.toStatement(this.statements.length - 1);
    } else if (this.currentStatement <= edges ? 1 : 0) {
        this.loopTo(this.statements.length - (edges ? 2 : 1));
    } else {
        this.toStatement(this.currentStatement - 1);
    }
  }

  loopTo(statement) { 
    this.toStatement(statement); 
  }

  getTestimonyInfo(statement) {
    return {
      statementText: this.statements[statement],
      music: this.inputToTag(this.musicInput.value, 'bgm'),
      continueSound: this.inputToTag(this.selectInput.value, 'bgs')
    }
  }
  
  addListenerMovements() {
    externals.messageListeners.addMessageListener(window, 'plain_message', (message) => {
      const direction = 
      externals.unknown.testRegex(message.text, "[> ]*") ? ">" 
      : externals.unknown.testRegex(message.text, "[< ]*") ? "<" : undefined;

      console.log(message);
      console.log(message.text);

      if(direction && message.text.includes(direction)) {
        this.testimonyArrow(direction);
      } else if(externals.unknown.testRegex(message.text, '<[0-9]*?>')) {
        const position = Number(message.text.slice(1, -1));
        this.testimonyPosition(position);
      }
    });
  }
  

  toStatement(statement) {
    let statementElem;
    if (this.currentStatement != statement) {
        this.currentStatement = statement;

        let added = false;
        let removed = false;
        for (let elem of this.TestimonyDiv.children) {
            if (!removed && elem.style.backgroundColor != '') {
                elem.style.removeProperty('background-color');
                removed = true;
            } else if (!added && elem.dataset.statement == String(this.currentStatement)) {
                elem.style.backgroundColor = '#552a2e';
                statementElem = elem;
                added = true;
            }
            if (removed && added) break;
        }
    } else {
        for (let elem of this.TestimonyDiv.children) {
            if (elem.dataset.statement != String(this.currentStatement)) continue;
            statementElem = elem;
            break;
        }
    }

    const { statementText, music, continueSound } = this.getTestimonyInfo(statement);
    let text = statementText;

    // Prepare text
    if (this.red && (statement == 0 || statement == this.statements.length - 1)) {
        text = '[##nt][##ct][#/r]' + text + '[/#]';
    } else if (this.crossExam) {
        text = text.replaceAll(/\[#.*?\]/g, '');
        text = text.replaceAll('[/#]', '');
        text = continueSound + '[##ce][##dd][#ts10][#/g]' + text + '[/#]';
    }


    //Stop Cross Examining
    
    if (!this.crossExam && statement == this.statements.length - 1) {
        if (this.red) {
            text = stylers.TAGS.MUSIC_FADE_OUT + text;
        } else {
            text = text + stylers.TAGS.MUSIC_FADE_OUT;
        }
    } else if (!this.crossExam && this.red && statement == 0 && music) {
        text = stylers.TAGS.MUSIC_STOP + text;
    }

    if (this.statementCache[statementText] === undefined) {
        this.statementCache[statementText] = {
            id: this.lastStatementId
        }
        this.lastStatementId += 1;
    } else if (this.statementCache[statementText].poseName) {
        this.setElemPoseName(statementElem, this.statementCache[statementText].poseName);
    }

    text = '[##tmid' + this.statementCache[statementText].id + ']' + text;
    this.court.sendText(text);
  }

  _updateTestimonyRedStyles() {
    if(!(this.TestimonyDiv.childElementCount > 0)) return;

    const elems = [this.TestimonyDiv.firstElementChild.firstElementChild, this.TestimonyDiv.lastElementChild.firstElementChild];

    this.red ?
    elems.forEach(elem => elem.style.color = "#f00") :
    elems.forEach(elem => elem.style.removeProperty('color'))
  }

  setTestimonyRed() {
    this.red = !this.red;
    this._updateTestimonyRedStyles();
    return this.red;
  }

  getPoses() {
    externals.messageListeners.addMessageListener(window, 'set_statement_pose_name', data => {
      const statementText = Object.keys(this.statementCache).find(text => this.statementCache[text].id === data.id);
      const statementObj = this.statementCache[statementText];
      statementObj.poseName = data.name;

      if (!this.testimonyLocked) return;

      Array.from(this.TestimonyDiv.children)
      .filter(statementElem => statementElem.querySelector('span').innerText === statementText)
      .forEach(statementElem => this.setElemPoseName(statementElem, data.name));  
  });
  }

  getCharacterWatcher() {
    let characterObserver = new MutationObserver(mutations => {
      Array.from(mutations).filter(mutation => mutation.attributeName == "style" || typeof mutation.oldValue == "string")
      .forEach((mutation) => {
        const oldIcon = mutation.oldValue.match(/background-image: (url\(\".*?\"\));/)[1];
        const newIcon = mutation.target.style.backgroundImage;
        if(oldIcon !== newIcon) {
          this.resetCache();
          Array.from(document.querySelectorAll('.pose-message')).forEach(elem => {
            elem.data.pose = '';
            elem.innerText = '';
          });
        }
      });
  });
  
  new MutationObserver((mutations, observer) => {
    Array.from(mutations.addedNodes)
    .filter(node => node.matches('div.v-image__image[style*="background-image:"]'))
    .forEach(node => {
      characterObserver.observe(node, {
        attributes: true,
        attributeOldValue: true
      })
      observer.disconnect();
    });      
  }).observe(document.querySelector('div.col-sm-3.col-2 div.icon-character'), {childList: true});
}}
