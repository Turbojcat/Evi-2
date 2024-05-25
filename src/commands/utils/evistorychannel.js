// src/commands/utils/evistorychannel.js
const { setStoryChannel, getStoryChannel, removeStoryChannel } = require('../../database/database');

module.exports = {
  name: 'evistorychannel',
  description: 'Manages the story channel for the server',
  usage: '<add|remove> <channel>',
  aliases: ['esc'],
  permissions: ['MANAGE_CHANNELS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    // ...
  },
  data: {
    name: 'evistorychannel',
    description: 'Manages the story channel for the server',
    options: [
      {
        name: 'action',
        type: 3, // STRING
        description: 'The action to perform (add or remove)',
        required: true,
        choices: [
          {
            name: 'Add',
            value: 'add',
          },
          {
            name: 'Remove',
            value: 'remove',
          },
        ],
      },
      {
        name: 'channel',
        type: 7, // CHANNEL
        description: 'The channel to set as the story channel',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const action = interaction.options.getString('action');
    const channel = interaction.options.getChannel('channel');

    if (action === 'add') {
      if (!channel) {
        return interaction.reply('Please provide a channel to set as the story channel.');
      }
      await setStoryChannel(interaction.guild.id, channel.id);
      interaction.reply(`Story channel set to ${channel}`);
    } else if (action === 'remove') {
      await removeStoryChannel(interaction.guild.id);
      interaction.reply('Story channel removed');
    }
  },
};