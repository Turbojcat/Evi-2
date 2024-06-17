// src/commands/moderation/warnings.js
const { getWarnings } = require('../../database/moderationdb');

module.exports = {
  name: 'warnings',
  description: 'Displays the warning history of a user',
  usage: '<user>',
  permissions: ['MANAGE_MESSAGES'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.send('Please provide a user to view warnings for.');
    }

    const warnings = await getWarnings(message.guild.id, user.id);

    if (warnings.length === 0) {
      return message.channel.send(`No warnings found for ${user}.`);
    }

    const warningList = warnings.map((warning, index) => {
      const moderator = message.guild.members.cache.get(warning.moderator_id);
      return `${index + 1}. Moderator: ${moderator}, Reason: ${warning.reason}, Date: ${new Date(warning.timestamp).toLocaleString()}`;
    }).join('\n');

    message.channel.send(`Warnings for ${user}:\n${warningList}`);
  },
  data: {
    name: 'warnings',
    description: 'Displays the warning history of a user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to view warnings for',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');

    const warnings = await getWarnings(interaction.guild.id, user.id);

    if (warnings.length === 0) {
      return interaction.reply(`No warnings found for ${user}.`);
    }

    const warningList = warnings.map((warning, index) => {
      const moderator = interaction.guild.members.cache.get(warning.moderator_id);
      return `${index + 1}. Moderator: ${moderator}, Reason: ${warning.reason}, Date: ${new Date(warning.timestamp).toLocaleString()}`;
    }).join('\n');

    interaction.reply(`Warnings for ${user}:\n${warningList}`);
  },
};
