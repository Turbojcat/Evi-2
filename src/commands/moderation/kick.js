// src/commands/moderation/kick.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'kick',
  description: 'Kicks a user from the server',
  usage: '<user> [reason]',
  permissions: ['KICK_MEMBERS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!user) {
      return message.channel.send('Please provide a user to kick.');
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.channel.send('User not found in the server.');
    }

    await member.kick(reason);
    await addModerationLog(message.guild.id, message.author.id, 'Kick', user.id, reason);

    message.channel.send(`Kicked ${user} from the server. Reason: ${reason}`);
  },
  data: {
    name: 'kick',
    description: 'Kicks a user from the server',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to kick',
        required: true,
      },
      {
        name: 'reason',
        type: 3, // STRING
        description: 'The reason for the kick',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply('User not found in the server.');
    }

    await member.kick(reason);
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Kick', user.id, reason);

    interaction.reply(`Kicked ${user} from the server. Reason: ${reason}`);
  },
};
