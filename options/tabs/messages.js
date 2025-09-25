
export const messages = {
    title: 'Messages',
    items: [
        { key: 'newlines', title: 'New lines', description: 'Shift+Enter adds a new line.', preview: 'previews/newlines.png' },
        { key: 'fix-tag-nesting', title: 'Fix tags inside color tags', description: 'Fixes tags inside of color tags such as [#/r][#bgs1][/#] not working.', preview: 'previews/fix-tag-nesting.png' },
        { key: 'more-color-tags', title: 'More color tags', description: 'Converts [#/y], [#/w] and [#/dr] into valid color tags.', preview: 'previews/more-color-tags.png' },
        { key: 'no-talk-toggle', title: '"No talking" toggle', description: 'Disables your character\'s talking animation, just like in Objection Maker.', preview: 'previews/no-talk-toggle.png' },
        { key: 'dont-delay-toggle', title: '"Don\'t Delay Dialogue" toggle', description: 'Adds the "Don\'t Delay Dialogue" toggle from Objection Maker.', preview: 'previews/dont-delay-toggle.png' },
        { key: 'comma-pause', title: 'Quickly typing pauses', description: 'Press , again after a , or other punctuation marks to add pauses.<br>(Typing more , increases the delay.)', preview: 'previews/comma-pause.webp' },
        { key: 'ctrl-effects', title: 'Effect hotkeys', description: 'Quickly add the Flash and Shake tags by pressing CTRL + 1, CTRL + 2, or CTRL + 3.', preview: 'previews/ctrl-effects.webp' },
        { key: 'alt-colors', title: 'Color hotkeys', description: 'Quickly color selected text red, blue or green by pressing ALT + 1, ALT + 2, or ALT + 3.', preview: 'previews/alt-colors.webp' },
        { key: 'dual-button', title: 'Dual effect button', description: 'Insert both Flash and Shake at the same time.', preview: 'previews/dual-button.png' },
        { key: 'smart-tn', title: 'Smart "to normal" poses', description: 'When switching poses, automatically plays the last pose\'s "to normal" if available.<br>(Lags less without Preload Resources.)', preview: 'previews/smart-tn.webp' },
    ]
};
