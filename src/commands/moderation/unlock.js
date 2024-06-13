// src/commands/moderation/unlock.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'unlock',
  description: 'Unlocks a previously locked channel',
  usage: '[channel]',
  permissions: ['MANAGE_CHANNELS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const channel = message.mentions.channels.first() || message.channel;

    await channel.permissionOverwrites.edit(message.guild.id, { SEND_MESSAGES: null });
    await addModerationLog(message.guild.id, message.author.id, 'Unlock', channel.id);

    message.channel.send(`Unlocked channel ${channel}.`);
  },
  data: {
    name: 'unlock',
    description: 'Unlocks a previously locked channel',
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

    await channel.permissionOverwrites.edit(interaction.guild.id, { SEND_MESSAGES: null });
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Unlock', channel.id);

    interaction.reply(`Unlocked channel ${channel}.`);
  },
};
