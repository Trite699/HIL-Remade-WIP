
const helpersUtils = {};

const { text } = extUtils;

/**
 * Insert or replaces the text in the textbox of objection.lol at speficied positions for HILR (a web extension)
 * This function cannot be used manually due to requiring changed arguments.
 * 
 * @param {HTMLTextAreaElement} textArea - The text area that will get modified
 * @param {HTMLElement} inputElem - The current text available (type might be incorrect)
 * @param {string} text - The new text to be inserted
 * @param {number} startIndex - The starting index of where the insertion will take place.
 * @param {number} endIndex - The end of where the insertion will take place.
 * @returns {void}
 */
helpersUtils.insertReplaceValue = function(textArea, inputElem, text, startIndex, endIndex = null) {
    if(!extUtils?.text?.setValue) {
        console.error('insertReplaceValue: Dependent utility extUtils.text.setValue is missing or improperly structured.');
        return;
    }

    if(!textArea) {
        console.error("insertReplaceValue: Required argument `textArea` is null or undefined.");
        return;
    }

    if(!inputElem) {
        console.error("insertReplaceValue: Required argument `inputElem` is null or undefined.");
        return;
    }

    endIndex = endIndex ?? startIndex;    
    
    let newText = extUtils.text.setValue(
        inputElem, 
        textArea.value.slice(0, startIndex) + text + textArea.value.slice(endIndex)
    );

    const newCursorPosition = startIndex + text.length;
    textArea.selectionStart = newCursorPosition;
    textArea.selectionEnd = newCursorPosition;
}

/**
 * Sets the options for hold.it.lol
 * @param {Object} options - The current list of options for the application
 * @param {string} key - The inner name for the option referred by the program
 * @param {boolean} value - The value choosen for the state of the option
 * @returns {Promise<void>}
 *
 */
helpersUtils.optionSet = function(options, key, value) {
    return new Promise((resolve, reject) => {

        if(!options) return reject(new Error("optionsSet: Required argument `options` is null or undefined."));
        if(!key || typeof value === undefined) return reject(new Error("The key-value pair is null or undefined for the function optionSet"));

        options[key] = value;
        chrome.storage.local.get({ 'options': {}}, function(result) {
        const currentOptions = result.options;
        currentOptions[key] = value;
        chrome.storage.local.set({ 'options': currentOptions }, function() {
            if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError));
            resolve();
        });   
    });
    });
}
/**
 * Waits for an element to appear in the DOM, with timeout.
 * @param {string} selector - CSS selector of the element to locate
 * @param {Element} selection - Parent element to observe for changes
 * @param {number} [timeout=3000] - Maximum time to wait in milliseconds
 * @returns {Promise<Element>} Promise that resolves with the found element
 * @throws {Error} Throws if element is not found within timeout period
 */

helpersUtils.waitForElement = function(selector, selection, timeout = 3000) {
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
        elementFinderObserver.disconnect();
        return reject(new Error(`Timeout (${timeout}ms) waiting for element: ${selector}`));
      }, timeout);

      elementFinderObserver.observe(selection, {
        childList: true,
        subtree: true
      });
    })
}


helpersUtils.inCourtroom = function() {
  return document.URL.split("courtroom/").length > 1;
}

