'use strict';

const shakeDuration = 400;
const extraDuration = shakeDuration + 100;

/* 
 * function 'main' formerly having three responsbilities commits to two now:
 * 1. On a button being clicked it would shake the button
 * 2. Take users to the options button of hold.it. 
 * 
 * Formerly, it used to handle the creation of randomize courtrooms, but with the new systems in place
 * this functionally has been deemed impossible with the new version of the site.
 * 
 * Usage:
 * This function is used to make the options button shake when it is clicked in the web extension and switch to the options menu.
*/

function main() {
  for (let bubble of document.querySelectorAll('.bubble-btn')) {
    let timeout;
    bubble.addEventListener('click', function() {
      bubble.classList.remove('bubble-shake');
      bubble.offsetHeight;
      bubble.classList.add('bubble-shake');
      clearTimeout(timeout);
      timeout = setTimeout(() => bubble.classList.remove('bubble-shake'), shakeDuration);
    })
  }

  const btnOptions = document.getElementById('options');
  btnOptions.addEventListener('click', function() {
    setTimeout(function() {
      chrome.runtime.openOptionsPage();
      window.close();
    }, shakeDuration);
  });
}

main();
