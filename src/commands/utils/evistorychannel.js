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
    const subcommand = args[0];
    const channelInput = args[1];

    if (subcommand === 'add') {
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
        const currentStoryChannel = await getStoryChannel(message.guild.id);
        if (currentStoryChannel) {
          message.reply(`The story channel is already set to <#${currentStoryChannel}>. Please remove it before setting a new one.`);
        } else {
          await setStoryChannel(message.guild.id, channelId);
          message.reply(`Set the story channel to <#${channelId}>.`);
        }
      } catch (error) {
        console.error('Error setting story channel:', error);
        message.reply('An error occurred while setting the story channel.');
      }
    } else if (subcommand === 'remove') {
      try {
        const currentStoryChannel = await getStoryChannel(message.guild.id);
        if (currentStoryChannel) {
          await removeStoryChannel(message.guild.id);
          message.reply(`Removed the story channel <#${currentStoryChannel}>.`);
        } else {
          message.reply('There is no story channel set.');
        }
      } catch (error) {
        console.error('Error removing story channel:', error);
        message.reply('An error occurred while removing the story channel.');
      }
    } else {
      message.reply('Invalid subcommand. Please use `add` or `remove`.');
    }
  },
  data: {
    name: 'evistorychannel',
    description: 'Manages the story channel for the server',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds the story channel for the server',
        options: [
          {
            name: 'channel',
            type: 7, // CHANNEL
            description: 'The channel to set as the story channel',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the story channel for the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const channelId = interaction.options.getChannel('channel').id;

      try {
        const currentStoryChannel = await getStoryChannel(interaction.guild.id);
        if (currentStoryChannel) {
          interaction.reply(`The story channel is already set to <#${currentStoryChannel}>. Please remove it before setting a new one.`);
        } else {
          await setStoryChannel(interaction.guild.id, channelId);
          interaction.reply(`Set the story channel to <#${channelId}>.`);
        }
      } catch (error) {
        console.error('Error setting story channel:', error);
        interaction.reply('An error occurred while setting the story channel.');
      }
    } else if (subcommand === 'remove') {
      try {
        const currentStoryChannel = await getStoryChannel(interaction.guild.id);
        if (currentStoryChannel) {
          await removeStoryChannel(interaction.guild.id);
          interaction.reply(`Removed the story channel <#${currentStoryChannel}>.`);
        } else {
          interaction.reply('There is no story channel set.');
        }
      } catch (error) {
        console.error('Error removing story channel:', error);
        interaction.reply('An error occurred while removing the story channel.');
      }
    }
  },
};
