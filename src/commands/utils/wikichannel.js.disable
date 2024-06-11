// src/commands/utils/wikichannel.js
const { setWikiChannel, removeWikiChannel } = require('../../database/wiki');

module.exports = {
  name: 'wikichannel',
  description: 'Sets or removes the wiki channel',
  usage: '<add|remove> [channel]',
  aliases: ['wc'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const channelInput = args[1];

    if (subcommand === 'add') {
      if (!channelInput) {
        return message.reply('Please provide a channel to set as the wiki channel.');
      }

      let channelId;
      if (channelInput.startsWith('<#') && channelInput.endsWith('>')) {
        channelId = channelInput.slice(2, -1);
      } else if (message.guild.channels.cache.has(channelInput)) {
        channelId = channelInput;
      } else {
        const channel = message.guild.channels.cache.find(c => c.name === channelInput);
        if (channel) {
          channelId = channel.id;
        }
      }

      if (!channelId) {
        return message.reply('Invalid channel. Please provide a valid channel mention, ID, or name.');
      }

      try {
        await setWikiChannel(message.guild.id, channelId);
        message.reply(`Wiki channel set to <#${channelId}>.`);
      } catch (error) {
        console.error('Error setting wiki channel:', error);
        message.reply('An error occurred while setting the wiki channel. Please try again later.');
      }
    } else if (subcommand === 'remove') {
      try {
        await removeWikiChannel(message.guild.id);
        message.reply('Wiki channel removed successfully.');
      } catch (error) {
        console.error('Error removing wiki channel:', error);
        message.reply('An error occurred while removing the wiki channel. Please try again later.');
      }
    } else {
      message.reply('Invalid subcommand. Please use "add" or "remove".');
    }
  },
  data: {
    name: 'wikichannel',
    description: 'Sets or removes the wiki channel',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Sets the wiki channel',
        options: [
          {
            name: 'channel',
            type: 7, // CHANNEL
            description: 'The channel to set as the wiki channel',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the wiki channel',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    if (subcommand === 'add') {
      try {
        await setWikiChannel(interaction.guild.id, channel.id);
        interaction.reply(`Wiki channel set to <#${channel.id}>.`);
      } catch (error) {
        console.error('Error setting wiki channel:', error);
        interaction.reply('An error occurred while setting the wiki channel. Please try again later.');
      }
    } else if (subcommand === 'remove') {
      try {
        await removeWikiChannel(interaction.guild.id);
        interaction.reply('Wiki channel removed successfully.');
      } catch (error) {
        console.error('Error removing wiki channel:', error);
        interaction.reply('An error occurred while removing the wiki channel. Please try again later.');
      }
    }
  },
};