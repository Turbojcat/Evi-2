// src/commands/setup/leavemessage.js
const { EmbedBuilder } = require('discord.js');
const { getLeaveMessage, setLeaveMessage, getLeaveChannelId, setLeaveChannelId } = require('../../database/welcomeLeave');
const { replacePlaceholders } = require('../../placeholders');

module.exports = {
  name: 'leavemessage',
  description: 'Manages the leave message for members who leave the server',
  usage: '<set|remove|channel> [message|channelID]',
  aliases: ['leavemsg', 'lm'],
  permissions: [],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const leaveMessage = args.slice(1).join(' ');

    if (subcommand === 'set') {
      if (!leaveMessage) {
        return message.reply('Please provide a leave message.');
      }

      try {
        await setLeaveMessage(message.guild.id, leaveMessage);
        const replacedMessage = replacePlaceholders(message.member, leaveMessage);
        message.reply(`Leave message set to "${replacedMessage}".`);
      } catch (error) {
        console.error('Error setting leave message:', error);
        message.reply('An error occurred while setting the leave message.');
      }
    } else if (subcommand === 'remove') {
      try {
        await setLeaveMessage(message.guild.id, null);
        message.reply('Leave message removed.');
      } catch (error) {
        console.error('Error removing leave message:', error);
        message.reply('An error occurred while removing the leave message.');
      }
    } else if (subcommand === 'channel') {
      const channelId = args[1];
      if (!channelId) {
        return message.reply('Please provide a channel ID.');
      }

      try {
        await setLeaveChannelId(message.guild.id, channelId);
        message.reply(`Leave channel set to <#${channelId}>.`);
      } catch (error) {
        console.error('Error setting leave channel:', error);
        message.reply('An error occurred while setting the leave channel.');
      }
    } else {
      message.reply('Invalid subcommand. Please use "set", "remove", or "channel".');
    }
  },
  data: {
    name: 'leavemessage',
    description: 'Manages the leave message for members who leave the server',
    options: [
      {
        name: 'set',
        type: 1, // SUB_COMMAND
        description: 'Sets the leave message',
        options: [
          {
            name: 'message',
            type: 3, // STRING
            description: 'Leave message with placeholders',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the leave message',
      },
      {
        name: 'channel',
        type: 1, // SUB_COMMAND
        description: 'Sets the leave channel',
        options: [
          {
            name: 'channelid',
            type: 7, // CHANNEL
            description: 'Channel ID for the leave message',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const leaveMessage = interaction.options.getString('message');

      try {
        await setLeaveMessage(interaction.guild.id, leaveMessage);
        const replacedMessage = replacePlaceholders(interaction.member, leaveMessage);
        interaction.reply(`Leave message set to "${replacedMessage}".`);
      } catch (error) {
        console.error('Error setting leave message:', error);
        interaction.reply('An error occurred while setting the leave message.');
      }
    } else if (subcommand === 'remove') {
      try {
        await setLeaveMessage(interaction.guild.id, null);
        interaction.reply('Leave message removed.');
      } catch (error) {
        console.error('Error removing leave message:', error);
        interaction.reply('An error occurred while removing the leave message.');
      }
    } else if (subcommand === 'channel') {
      const channelId = interaction.options.getChannel('channelid').id;

      try {
        await setLeaveChannelId(interaction.guild.id, channelId);
        interaction.reply(`Leave channel set to <#${channelId}>.`);
      } catch (error) {
        console.error('Error setting leave channel:', error);
        interaction.reply('An error occurred while setting the leave channel.');
      }
    }
  },
};
