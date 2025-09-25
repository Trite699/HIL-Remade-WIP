
export const moderation =  {
  title: 'Moderation',
  items: [
    { key: 'remute', title: 'Automatic re-mute', description: '(Discord auth required) Automatically re-mutes a muted user if they rejoin.', preview: 'previews/remute.png' },
    { key: 'chat-moderation', title: 'Moderate from chat log', description: 'Quickly mute or ban using buttons next to their messages.', preview: 'previews/chat-moderation.png' },
    { key: 'list-moderation', title: 'Moderate from user list', description: 'Quickly mute, ban anyone or make them a moderator from the user list.', preview: 'previews/list-moderation.png' },
    { key: 'mute-character', requires: 'list-moderation', title: 'Hide character', description: 'Someone\'s character is laggy or unpleasant? Mute just the character, while still seeing their messages.', preview: 'previews/mute-character.png', requires: 'list-moderation' },
  ],
}
