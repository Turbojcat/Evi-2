// src/commands/moderation/warn.js
const { addWarning, addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'warn',
  description: 'Issues a warning to a user',
  usage: '<user> [reason]',
  permissions: ['MANAGE_MESSAGES'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!user) {
      return message.channel.send('Please provide a user to warn.');
    }

    await addWarning(message.guild.id, user.id, message.author.id, reason);
    await addModerationLog(message.guild.id, message.author.id, 'Warn', user.id, reason);

    message.channel.send(`Warned ${user}. Reason: ${reason}`);
  },
  data: {
    name: 'warn',
    description: 'Issues a warning to a user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to warn',
        required: true,
      },
      {
        name: 'reason',
        type: 3, // STRING
        description: 'The reason for the warning',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await addWarning(interaction.guild.id, user.id, interaction.user.id, reason);
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Warn', user.id, reason);

    interaction.reply(`Warned ${user}. Reason: ${reason}`);
  },
};
