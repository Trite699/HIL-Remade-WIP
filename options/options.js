'use strict';

import { convenience } from './tabs/convenience.js';
import { messages } from './tabs/messages.js';
import { user_interface } from './tabs/user_interface.js';
import { moderation } from './tabs/moderation.js';
import { new_features } from './tabs/new_features.js';
import { music_packs } from './tabs/music_packs.js';

class OptionsController {
  constructor() {
    this.toggleHovering = null;
    this.optionsChanged = false;
    this.courtroomOpen = false;
    this.requireesRows = new Map();
    this.tabs = [
      convenience,
      messages,
      user_interface,
      moderation,
      new_features,
      music_packs
    ];

    this.HTMLEntryPoint = ".main";
  }

  error(text) {
    const elem = document.querySelector(".error");
    elem.firstElementChild.textContent = text;
    elem.style.maxHeight = 'var(--header-height)';
  }

  _createReadMeContent() {
    let string = "";
    for (let category of this.tabs) {
        string += `<details><summary>${category.title}</summary><br><blockquote><table>\n`;
        if(category.title === 'Music Packs') {
            let first = true;
            for (let item of category.items) {
                string += `<tr><td>${item.title}</td><td>`;
                if (first) string += "Use Ace Attorney songs from any game in objection.lol beyond the default music.";
                string += `</td></tr>\n`;
                first = false;
            }
        } else {
            for (let item of category.items) {
                string += `<tr><td>${item.title}</td><td>${item.description}</td></tr>\n`
            }
        }
        string += `</table></blockquote><br></details>\n`
    }
        return string;
    }

    chromeStorageExist() {
        if(chrome.storage === undefined) { 
            this.error("Please open this page from the pop-up or chrome://extensions to change options.");
            return false;
        }
        return true;
    }

    optionSet(key, value) {
        chrome.storage.local.get('options', function(results) {
            const options = results.options || {};
            options[key] = value;
            options['seen-tutorial'] = true;
            chrome.storage.local.set({ 'options': options }); 
        });
    }

    checkCourtroomStatus() {
        if(!this.chromeStorageExist()) { return; }
        
        chrome.tabs.query(
        {
            "url": "*://objection.lol/courtroom/*"
        },
        (tabs) => {
            if(tabs.length > 0) {
                this.courtroomOpen = true;
            }
        });
    }

    setupInitMouseUpListener() {
        document.addEventListener('mouseup', () => {
        this.toggleHovering = null;
        document.body.style.cssText = '';
        if(this.optionChanged && this.courtroomOpen) {
            this.error("Reload your objection.lol/courtroom to see the changes.");
        }});
    }

    createTab(tab) {
        const row = this.createTabRow(tab);
        const section = this.createTabSection();
        row.addEventListener('click', function () {
        const expanded = !row.classList.contains('expanded');
        
        for (let expandedRow of document.querySelectorAll('.expanded')) {
            expandedRow.classList.remove('expanded');
            expandedRow.nextElementSibling.style.maxHeight = null;
        }

        if (expanded) {
            row.classList.add('expanded');
            section.style.maxHeight = section.scrollHeight + "px";
        }});
        return [row, section];
    }

    createTabRow(tab) {
        const row = document.createElement('div');
        row.className = 'row hoverable row-tab';
        const title = document.createElement('span');
        title.textContent = tab.title;
        row.appendChild(title);

        const arrow = document.createElement('div');
        arrow.className = 'tab-arrow';
        arrow.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>';
        row.appendChild(arrow);

        return row;
    }

    createTabSection() {
        const section = document.createElement('div');
        section.className = 'tab-section';
        return section;
    }

    createSwitch(onchange) {
        const label = document.createElement('div');
        label.className = 'hil-toggle';
        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.style.setProperty('display', 'none');

        label.set = (val) => {
            if (label.classList.contains('force-disabled')) return;
            if (input.checked == Boolean(val)) return;
            input.checked = val;
            this.toggleHovering = input.checked;
            document.body.style.cssText = 'cursor: pointer !important';
            onchange(input.checked);
        }

        label.addEventListener('mousedown', function (e) {
            label.set(!input.checked);
            e.preventDefault();
        });

        const span = document.createElement('span');
        span.className = 'switch';
        const handle = document.createElement('span');
        handle.className = 'handle';

        label.appendChild(input);
        label.appendChild(span);
        label.appendChild(handle);
        return label;
    }

    _createOptionRowElement(option) {
        const row = document.createElement('div');
        row.className = 'row hoverable row-option';

        this._checkOptionsStatus(row, option);

        const titleContainer = document.createElement('div');
        titleContainer.className = 'label-container';
        row.appendChild(titleContainer);

        const title = document.createElement('div');
        const desc = document.createElement('div');
        title.className = 'option-label';
        desc.className = 'option-label option-desc';
        title.textContent = option.title;
        desc.innerHTML = option.description;
        titleContainer.appendChild(title);
        titleContainer.appendChild(desc);      

        return row;  
    }

    _checkOptionsStatus(row, option) {
        if (option.requires !== undefined) {
            this.requireesRows.set(option.key, row);
            row.classList.add('row-disabled');
            const indent = document.createElement('div');
            indent.className = 'option-indent';
            row.appendChild(indent);
        }
    }

    _createSwitchWithCallback(option, row, optionList) {
        const requirees = [];
        for (let otherOption of optionList) {
            if (otherOption.requires !== option.key) continue;
            requirees.push(otherOption.key);
        }
        const isRequirement = requirees.length > 0;

        return this.createSwitch((checked) => {
            if (row.classList.contains('force-disabled')) return;
            this.optionSet(option.key, checked);
            this.optionChanged = true;
            if (isRequirement) requirees.forEach((key) => {
                const optionRow = this.requireesRows.get(key);
                const disabledMethod = checked ? 'remove' : 'add';
                optionRow.classList[disabledMethod]('row-disabled');
                optionRow.querySelector('.hil-toggle').classList[disabledMethod]('force-disabled');
            });
        });
    }

    createOptionRow(option, optionList) {
        const row = this._createOptionRowElement(option);
        const optionSwitch = this._createSwitchWithCallback(option, row, optionList);
        if (option.requires !== undefined) optionSwitch.classList.add('force-disabled');

        row.appendChild(optionSwitch);
        row.addEventListener('mouseenter', () => {
            if (this.toggleHovering === null) return;
            optionSwitch.set(this.toggleHovering);
        });

        if (option.preview) {
            const { preview, previewHeader, previewImg } = this._setUpPreview(row, option);
            this._addPreviewListeners(row, preview, previewHeader, previewImg, optionSwitch);
        }
        return row;
    }

    _setUpPreview(row, option) { 
        const preview = document.createElement('div');
        const previewHeader = document.createElement('div');
        preview.appendChild(previewHeader);
        const span = document.createElement('span');
        span.textContent = option.title;
        previewHeader.appendChild(span);

        const previewImg = document.createElement('img');
        preview.className = "preview";
        previewImg.src = option.preview;
        preview.appendChild(previewImg);

        row.appendChild(preview);

        return { preview, previewHeader, previewImg };
    }

    _addPreviewListeners(row, preview, previewHeader, previewImg, optionSwitch) {
        row.addEventListener('mouseenter', function () {
        const left = optionSwitch.getClientRects()[0].right;
        if (left < window.innerWidth - 300) {
            preview.style.setProperty('--left', (left + 20) + 'px');
            const top = row.getClientRects()[0].top;
            preview.style.setProperty('top', (top > (window.innerHeight - previewImg.offsetHeight * 1.25) ? (window.innerHeight - previewImg.offsetHeight * 1.25) : top) + 'px');
        } else {
            preview.style.setProperty('--left', (window.innerWidth - 400) + 'px');
            const bottom = row.getClientRects()[0].bottom;
            preview.style.setProperty('top', (bottom < (window.innerHeight - previewImg.offsetHeight * 1.25) ? row.getClientRects()[0].bottom : row.getClientRects()[0].top - previewImg.offsetHeight * 1.25) + 'px');
        }
        previewHeader.style.setProperty('height', previewImg.offsetHeight / 4 + 'px');
        preview.style.opacity = "1";})

        row.addEventListener('mouseleave', function () {
                preview.style.opacity = null;
        })
    }

    _renderUserInterface() {
        const mainDiv = document.querySelector(this.HTMLEntryPoint);
        const optionSwitches = {};
        const optionList = this.tabs.flatMap(tab => tab.items);

        for(let tab of this.tabs) {
            const [tabRow, section] = this.createTab(tab);
            mainDiv.appendChild(tabRow);
            mainDiv.appendChild(section);
            for(let option of tab.items) {
                 const optionRow = this.createOptionRow(option, optionList);
                section.appendChild(optionRow);
                optionSwitches[option.key] = optionRow.querySelector('input');
            }
        }
        return { optionList, optionSwitches };
    }

    _loadOptions(optionList, optionSwitches) {
        chrome.storage.local.get('options', (result) => {
            const options = result.options || {};
            for (let key of Object.keys(optionSwitches)) {
                const input = optionSwitches[key];
                input.checked = options[key] !== undefined ? options[key] : false;
            }
            this.requireesRows.forEach(function(optionRow, key) {
                const option = optionList.find(option => option.key === key);
                if (!options[option.requires]) return;
                optionRow.classList.remove('row-disabled');
                optionRow.querySelector('.hil-toggle').classList.remove('force-disabled');
            });
        });
    }

    init() {
        if(!this.chromeStorageExist()) { return; }
        this.checkCourtroomStatus();
        this.setupInitMouseUpListener();
        const {optionList, optionSwitches} = this._renderUserInterface();
        this._loadOptions(optionList, optionSwitches);
    }
}

window.addEventListener('load', function() {
    const optionsApp = new OptionsController();
    optionsApp.init();
});

