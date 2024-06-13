// src/commands/moderation/clearwarns.js
const { clearWarnings, addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'clearwarns',
  description: 'Clears the warnings of a user',
  usage: '<user>',
  permissions: [],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.send('Please provide a user to clear warnings for.');
    }

    await clearWarnings(message.guild.id, user.id);
    await addModerationLog(message.guild.id, message.author.id, 'Clear Warnings', user.id);

    message.channel.send(`Cleared warnings for ${user}.`);
  },
  data: {
    name: 'clearwarns',
    description: 'Clears the warnings of a user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to clear warnings for',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');

    await clearWarnings(interaction.guild.id, user.id);
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Clear Warnings', user.id);

    interaction.reply(`Cleared warnings for ${user}.`);
  },
};
