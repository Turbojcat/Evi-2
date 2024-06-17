const { PermissionFlagsBits } = require('discord.js');
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'unlock',
  description: 'Unlocks a channel, allowing users to send messages',
  usage: '[channel]',
  permissions: ['MANAGE_CHANNELS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.id, {
        [PermissionFlagsBits.SendMessages]: true
      });
      await addModerationLog(message.guild.id, message.author.id, 'Unlock', channel.id);
      message.channel.send(`Unlocked channel ${channel}.`);
    } catch (error) {
      console.error('Error unlocking channel:', error);
      message.channel.send('An error occurred while unlocking the channel. Please try again later.');
    }
  },
  data: {
    name: 'unlock',
    description: 'Unlocks a channel, allowing users to send messages',
    options: [
      {
        name: 'channel',
        type: 7, // CHANNEL
        description: 'The channel to unlock (default: current channel)',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.id, {
        [PermissionFlagsBits.SendMessages]: true
      });
      await addModerationLog(interaction.guild.id, interaction.user.id, 'Unlock', channel.id);
      interaction.reply(`Unlocked channel ${channel}.`);
    } catch (error) {
      console.error('Error unlocking channel:', error);
      interaction.reply({ content: 'An error occurred while unlocking the channel. Please try again later.', ephemeral: true });
    }
  },
};
