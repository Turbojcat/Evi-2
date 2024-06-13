// src/commands/moderation/unmute.js
const { removeMute, addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'unmute',
  description: 'Unmutes a previously muted user',
  usage: '<user>',
  permissions: ['MUTE_MEMBERS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.send('Please provide a user to unmute.');
    }

    await removeMute(message.guild.id, user.id);
    await addModerationLog(message.guild.id, message.author.id, 'Unmute', user.id);

    message.channel.send(`Unmuted ${user}.`);
  },
  data: {
    name: 'unmute',
    description: 'Unmutes a previously muted user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to unmute',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');

    await removeMute(interaction.guild.id, user.id);
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Unmute', user.id);

    interaction.reply(`Unmuted ${user}.`);
  },
};
