
const helpersUtils = {}

const { text } = extUtils;

/**
 * Insert or replaces the text in the textbox of objection.lol at speficied positions for HILR (a web extension)
 * This function cannot be used manually.
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
 * 
 * @param {Object} options - The current list of options for the application
 * @param {string} key - The inner name for the option referred by the program
 * @param {boolean} value - The value choosen for the state of the option
 * @returns {void} 
 */

helpersUtils.optionSet = function(options, key, value) {
    return new Promise((resolve, reject) => {

        if(!options) return reject("optionsSet: Required argument `options` is null or undefined.");
        if(!key || typeof value == undefined) return reject("The key-value pair is null or undefined for the function optionSet");

        options[key] = value;
        chrome.storage.local.get({ 'options': {}}, function(result) {
        const currentOptions = result.options;
        currentOptions[key] = value;
        chrome.storage.local.set({ 'options': currentOptions }, function() {
            if(chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve();
        });   
    });
    });
}
