// src/commands/moderation/lock.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'lock',
  description: 'Locks a channel, preventing users from sending messages',
  usage: '[channel]',
  permissions: ['MANAGE_CHANNELS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const channel = message.mentions.channels.first() || message.channel;

    await channel.permissionOverwrites.edit(message.guild.id, { SEND_MESSAGES: false });
    await addModerationLog(message.guild.id, message.author.id, 'Lock', channel.id);

    message.channel.send(`Locked channel ${channel}.`);
  },
  data: {
    name: 'lock',
    description: 'Locks a channel, preventing users from sending messages',
    options: [
      {
        name: 'channel',
        type: 7, // CHANNEL
        description: 'The channel to lock (default: current channel)',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.id, { SEND_MESSAGES: false });
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Lock', channel.id);

    interaction.reply(`Locked channel ${channel}.`);
  },
};
