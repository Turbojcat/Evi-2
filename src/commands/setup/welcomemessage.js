// src/commands/setup/welcomemessage.js
const { EmbedBuilder } = require('discord.js');
const { getWelcomeMessage, setWelcomeMessage, getWelcomeChannelId, setWelcomeChannelId } = require('../../database/welcomeLeave');
const { replacePlaceholders } = require('../../placeholders');

module.exports = {
  name: 'welcomemessage',
  description: 'Manages the welcome message for new members',
  usage: '<set|remove|channel> [message|channelID]',
  aliases: ['welcomemsg', 'wm'],
  permissions: [],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const welcomeMessage = args.slice(1).join(' ');

    if (subcommand === 'set') {
      if (!welcomeMessage) {
        return message.channel.send('Please provide a welcome message.');
      }

      try {
        await setWelcomeMessage(message.guild.id, welcomeMessage);
        const replacedMessage = replacePlaceholders(message.member, welcomeMessage);
        message.channel.send(`Welcome message set to "${replacedMessage}".`);
      } catch (error) {
        console.error('Error setting welcome message:', error);
        message.channel.send('An error occurred while setting the welcome message.');
      }
    } else if (subcommand === 'remove') {
      try {
        await setWelcomeMessage(message.guild.id, null);
        message.channel.send('Welcome message removed.');
      } catch (error) {
        console.error('Error removing welcome message:', error);
        message.channel.send('An error occurred while removing the welcome message.');
      }
    } else if (subcommand === 'channel') {
      const channelId = args[1];
      if (!channelId) {
        return message.channel.send('Please provide a channel ID.');
      }

      try {
        await setWelcomeChannelId(message.guild.id, channelId);
        message.channel.send(`Welcome channel set to <#${channelId}>.`);
      } catch (error) {
        console.error('Error setting welcome channel:', error);
        message.channel.send('An error occurred while setting the welcome channel.');
      }
    } else {
      message.channel.send('Invalid subcommand. Please use "set", "remove", or "channel".');
    }
  },
  data: {
    name: 'welcomemessage',
    description: 'Manages the welcome message for new members',
    options: [
      {
        name: 'set',
        type: 1, // SUB_COMMAND
        description: 'Sets the welcome message',
        options: [
          {
            name: 'message',
            type: 3, // STRING
            description: 'Welcome message with placeholders',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the welcome message',
      },
      {
        name: 'channel',
        type: 1, // SUB_COMMAND
        description: 'Sets the welcome channel',
        options: [
          {
            name: 'channelid',
            type: 7, // CHANNEL
            description: 'Channel ID for the welcome message',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const welcomeMessage = interaction.options.getString('message');

      try {
        await setWelcomeMessage(interaction.guild.id, welcomeMessage);
        const replacedMessage = replacePlaceholders(interaction.member, welcomeMessage);
        interaction.reply(`Welcome message set to "${replacedMessage}".`);
      } catch (error) {
        console.error('Error setting welcome message:', error);
        interaction.reply('An error occurred while setting the welcome message.');
      }
    } else if (subcommand === 'remove') {
      try {
        await setWelcomeMessage(interaction.guild.id, null);
        interaction.reply('Welcome message removed.');
      } catch (error) {
        console.error('Error removing welcome message:', error);
        interaction.reply('An error occurred while removing the welcome message.');
      }
    } else if (subcommand === 'channel') {
      const channelId = interaction.options.getChannel('channelid').id;

      try {
        await setWelcomeChannelId(interaction.guild.id, channelId);
        interaction.reply(`Welcome channel set to <#${channelId}>.`);
      } catch (error) {
        console.error('Error setting welcome channel:', error);
        interaction.reply('An error occurred while setting the welcome channel.');
      }
    }
  },
};
