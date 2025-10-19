const extUtils = {}

extUtils.messageListeners = {

    addMessageListenerAll(window, callback) {
        function listener(event) {
            let eventAction, eventData;
            try {
                [ eventAction, eventData ] = event.data;
            } catch {
                return;
            }
            if (typeof eventAction === 'string') {
                callback(eventAction, eventData);
            }
        }
        window.addEventListener('message', listener);
        return listener; 
    },

    addMessageListener(window, action, callback, once=false) {
        const listener = this.addMessageListenerAll(window, function(eventAction, eventData) {
        if (eventAction !== action) return;
        callback(eventData);
        if (once) window.removeEventListener('message', listener);
        });
    } 
}

extUtils.unknown = {

    clickOff() {
        document.getElementById('app').firstElementChild.click(); 
    },

    testRegex(str, re) {
        const match = str.match(re);
        return match !== null && match[0] == match.input;
    },

    kindaRandomChoice(array, seed = null) {
        if (seed === null) seed = Math.random();
        const x = Math.sin(seed++) * 10000; 
        const random = x - Math.floor(x);
        const i = Math.floor(random * array.length);
        return array[i];
    },

    getLabel(innerText) {
        let foundElement = Array.from(document.querySelectorAll('label')).find(label => label.innerText == innerText);
        return foundElement;
    },

    getInputContent(app) {
        return app.querySelector('.menuable__content__active:not([role="menu"])');
    },

    wait(duration = 0) {
        return new Promise(function(resolve) {
            setTimeout(resolve, duration);
        });
    },

    fixTagNesting(text) {
        REGEX_TAG = /\[#[^/[\]]*?\]$/
        REGEX_COLOR_TAG = /\[#\/[0-9a-zA-Z]*?\]$/
        REGEX_UNCOLOR_TAG = /\[\/#\]$/
    
        newText = "";
        inColorTag = false;
        currentColorTag = "";
        nestedColorTags = [];
    
        for (let char of text) {
            newText += char;
            if (newText.match(REGEX_COLOR_TAG)) {
                if (!inColorTag) {
                    inColorTag = true;
                } else {
                    nestedColorTags.push(currentColorTag);
                    newText = newText.replace(REGEX_COLOR_TAG, "[/#]$&");
                }
                currentColorTag = newText.match(REGEX_COLOR_TAG)[0];
            } else if (inColorTag && newText.match(REGEX_TAG)) {
                newText = newText.replace(REGEX_TAG, "[/#]" + "$&" + currentColorTag);
            } else if (newText.match(REGEX_UNCOLOR_TAG)) {
                if (nestedColorTags.length > 0) {
                    currentColorTag = nestedColorTags.pop();
                    newText = newText.replace(REGEX_UNCOLOR_TAG, "$&" + currentColorTag);
                } else {
                    inColorTag = false;
                }
            }
        }
        return newText
    },

    compareShallow(a, b, keys) {
        for (const key of keys) {
            if (a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }
}

extUtils.theme = {
    getTheme() { 
        const currentThemeInput = (extUtils.unknown.getLabel("Dark mode") || extUtils.unknown.getLabel("Light mode")).parentElement.querySelector("input");
        return currentThemeInput.checked ? {themeInput: currentThemeInput, theme: "theme--dark"} : {themeInput: currentThemeInput, theme: "theme--light"};
    }
}

extUtils.text = {
    setValue(elem, text) {
        if (document.activeElement == elem) {
            elem.selectionEnd = 9999999;
            elem.selectionStart = 0;
            document.execCommand("insertText", false, text);
        } else {
            elem.value = text;
            elem.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },

    insertValue(elem, text, index) {
        if (document.activeElement == elem) {
            elem.selectionEnd = index;
            elem.selectionStart = index;
            document.execCommand("insertText", false, text);
        } else {
            const value = elem.value;
            this.setValue(elem, value.slice(0, index) + text + value.slice(index));
        }
    }
}

extUtils.buttons = {
    createButton(listener, text, classText, styleText) {
        const button = document.createElement('button');
        button.className = 'v-btn v-btn--has-bg v-size--default hil-row-btn hil-themed ' + 'dark-theme'; //TODO: Fix theme later
        if (classText) button.className += ' ' + classText;
        if (styleText) button.style.cssText = styleText;
        button.innerText = text;

        if (listener) button.addEventListener('click', listener);

        return button;
    },

    primaryButton(listener, classText, styleText, child) {
        const button = document.createElement('button');
        button.className = 'v-btn v-btn--depressed v-size--small primary ' + 'dark-theme';
        if (classText) button.className += ' ' + classText;
        if (styleText) button.style.cssText += styleText;
        if (child) button.appendChild(child);
    
        if (listener) button.addEventListener('click', listener);
    
        return button;
    },

    iconToggleButton(listenerCheck, text, classText, styleText, defaultEnabled = false) {
        function toggle(enabled){
            if (enabled) {
                button.classList.add('success');
                button.firstElementChild.classList.remove('mdi-close');
                button.firstElementChild.classList.add('mdi-check');
            } else {
                button.classList.remove('success');
                button.firstElementChild.classList.add('mdi-close');
                button.firstElementChild.classList.remove('mdi-check');
            }
        }
        const button = this.createButton(function() {
            const enabled = listenerCheck();
            toggle(enabled);
        }, text, classText, styleText);
        button.prepend(extUtils.creation.createIcon('close', 18, 'margin-right: 8px;'));
        if (defaultEnabled) toggle(true);
        return button;
    },

    createSwitch(onchange, def=false) {
        const label = document.createElement('div');
        label.className = 'hil-toggle';
        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.style.setProperty('display', 'none');
    
        label.set = function(val) {
            if (label.classList.contains('force-disabled')) return;
            if (input.checked == Boolean(val)) return;
            input.checked = val;
            onchange(input.checked);
        }
        if (def) label.set(true);
    
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
}

extUtils.dom = {
    getHTMLOfSelection() { // https://stackoverflow.com/questions/5083682/get-selected-html-in-browser-via-javascript
        let container = document.createElement('div');
        let range;
        if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            html = range.htmlText;
            container.innerHTML = html;
        }
        else if (window.getSelection) {
            let selection = window.getSelection();
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                let clonedSelection = range.cloneContents();
                container.appendChild(clonedSelection);
            }
        }
        return container;
    },

    htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    },
    
    verifyStructure(obj, structure) {
        if (!obj) obj = {};
        for (let key in structure) {
            let type = obj[key]?.constructor;
            const structureType = structure[key]?.constructor;
            
            if (!(key in obj) || (type !== structureType)) {
                obj[key] = structure[key];
            }
            
            type = obj[key]?.constructor;
            
            if (type === Object) {
                verifyStructure(obj[key], structure[key]);
            }
        }
        return obj;
    },

    getElements(classList, multiple=false) {
        const builtSelector = classList
        .split(" ")
        .map(cn => "." + cn.trim())
        .join("");

        const elements = multiple 
            ? document.querySelectorAll(builtSelector)
            : document.querySelector(builtSelector);

        if (!elements && !multiple) {
            console.error(`The element you were looking for does not exist in the document`);
            return null;
        }

        if (multiple && (!elements || elements.length === 0)) {
            console.error(`The elements you were looking for do not exist in the document`);
            return null;
        }

        return elements;
    }
}

extUtils.scripts = {
    injectScript(src, type = null)  {
        const script = document.createElement('script');
        script.setAttribute("src", src);
        if (type) script.setAttribute("type", type);
        (document.head || document.documentElement).appendChild(script);
    }
}

extUtils.slider = {
    sliderListener(event, sliderContainer, min, max, callback) {
        sliderContainer.querySelector('.v-slider__thumb-container').classList.add('v-slider__thumb-container--active');
        const adjust = function(e) {
            const sliderRect = sliderContainer.querySelector('.v-slider').getClientRects()[0];
            const sliderPosition = (e.clientX - sliderRect.x) / sliderRect.width;
            let value = Math.round(sliderPosition * (max - min) + min);
            if (value > max) value = max;
            else if (value < min) value = min;
            hilUtils.setSlider(sliderContainer, value, min, max);
            if (callback) callback(value);
        }
        adjust(event);
        document.addEventListener('mousemove', adjust);
        document.addEventListener('mouseup', function () {
            sliderContainer.querySelector('.v-slider__thumb-container').classList.remove('v-slider__thumb-container--active');
            document.removeEventListener('mousemove', adjust);
        }, { once: true });
    },

    setSlider(sliderContainer, value, min, max) {
        if (value > max) value = max;
        else if (value < min) value = min;
        const percentage = (value-min)/(max-min) * 100;
        sliderContainer.querySelector('.v-slider__track-fill').style.width = percentage + '%';
        sliderContainer.querySelector('.v-slider__thumb-container').style.left = percentage + '%';
        sliderContainer.querySelector('.v-slider__thumb-label span').textContent = value;
    }
}

extUtils.creation = {
    createIcon(iconClass, fontPx = 24, styleText = '', classText = '') {
        const icon = document.createElement('i');
        icon.className = `${iconClass} v-icon notranslate mdi hil-themed ${extUtils.theme.getTheme().value} mdi-${iconClass}`;
        if (fontPx && fontPx !== 24) icon.style.cssText = `font-size: ${fontPx}px`
        if (styleText) icon.style.cssText += styleText;
        return icon;
    },
    
    createTooltip(text, anchorElement) {
        const tooltip = document.createElement('div');
        tooltip.className = 'v-tooltip__content hil-small-tooltip hil-hide';
        tooltip.textContent = text;
        tooltip.realign = function (newText = null) {
            if (anchorElement === undefined) throw Error('Tooltip has no anchor anchorElement');
            if (newText !== null) tooltip.textContent = newText;
            const rect = anchorElement.getClientRects()[0];
            tooltip.style.left = (rect.x + rect.width / 2 - tooltip.clientWidth / 2) + 'px';
            tooltip.style.top = (rect.y + rect.height + 10) + 'px';
        }
        app.appendChild(tooltip);
        return tooltip;
    }
}

extUtils.transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    
window.postMessage(['loaded_utils']);