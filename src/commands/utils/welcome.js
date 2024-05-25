// src/commands/utils/welcome.js
const { EmbedBuilder } = require('discord.js');
const { getWelcomeChannel, getWelcomeMessage, setWelcomeChannel, setWelcomeMessage, removeWelcomeChannel, removeWelcomeMessage } = require('../../database/database');

module.exports = {
  name: 'welcome',
  description: 'Manages the welcome message for new members',
  usage: '<set|remove> [channel] [message]',
  aliases: ['welcomemsg', 'ws'],
  permissions: [],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const channelInput = args[1];
    const welcomeMessage = args.slice(2).join(' ');

    if (subcommand === 'set') {
      if (!channelInput || !welcomeMessage) {
        return message.reply('Please provide a channel and a welcome message.');
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
        await Promise.all([
          setWelcomeChannel(message.guild.id, channelId),
          setWelcomeMessage(message.guild.id, welcomeMessage),
        ]);
        message.reply(`Welcome message set to "${welcomeMessage}" in <#${channelId}>.`);
      } catch (error) {
        console.error('Error setting welcome message:', error);
        message.reply('An error occurred while setting the welcome message.');
      }
    } else if (subcommand === 'remove') {
      try {
        await Promise.all([
          removeWelcomeChannel(message.guild.id),
          removeWelcomeMessage(message.guild.id),
        ]);
        message.reply('Welcome message removed.');
      } catch (error) {
        console.error('Error removing welcome message:', error);
        message.reply('An error occurred while removing the welcome message.');
      }
    } else {
      message.reply('Invalid subcommand. Please use "set" or "remove".');
    }
  },
  data: {
    name: 'welcome',
    description: 'Manages the welcome message for new members',
    options: [
      {
        name: 'set',
        type: 1, // SUB_COMMAND
        description: 'Sets the welcome message and channel',
        options: [
          {
            name: 'channel',
            type: 7, // CHANNEL
            description: 'The channel to send the welcome message in',
            required: true,
          },
          {
            name: 'message',
            type: 3, // STRING
            description: 'The welcome message',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the welcome message',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const channel = interaction.options.getChannel('channel');
      const welcomeMessage = interaction.options.getString('message');

      try {
        await Promise.all([
          setWelcomeChannel(interaction.guild.id, channel.id),
          setWelcomeMessage(interaction.guild.id, welcomeMessage),
        ]);
        interaction.reply(`Welcome message set to "${welcomeMessage}" in <#${channel.id}>.`);
      } catch (error) {
        console.error('Error setting welcome message:', error);
        interaction.reply('An error occurred while setting the welcome message.');
      }
    } else if (subcommand === 'remove') {
      try {
        await Promise.all([
          removeWelcomeChannel(interaction.guild.id),
          removeWelcomeMessage(interaction.guild.id),
        ]);
        interaction.reply('Welcome message removed.');
      } catch (error) {
        console.error('Error removing welcome message:', error);
        interaction.reply('An error occurred while removing the welcome message.');
      }
    }
  },
};
