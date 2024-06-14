// src/commands/moderation/ban.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server',
  usage: '<user> [reason]',
  permissions: ['BAN_MEMBERS'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!user) {
      return message.channel.send('Please provide a user to ban.');
    }

    const member = message.guild.members.cache.get(user.id);
    if (member) {
      await member.ban({ reason });
    } else {
      await message.guild.members.ban(user, { reason });
    }

    await addModerationLog(message.guild.id, message.author.id, 'Ban', user.id, reason);

    message.channel.send(`Banned ${user} from the server. Reason: ${reason}`);
  },
  data: {
    name: 'ban',
    description: 'Bans a user from the server',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to ban',
        required: true,
      },
      {
        name: 'reason',
        type: 3, // STRING
        description: 'The reason for the ban',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = interaction.guild.members.cache.get(user.id);
    if (member) {
      await member.ban({ reason });
    } else {
      await interaction.guild.members.ban(user, { reason });
    }

    await addModerationLog(interaction.guild.id, interaction.user.id, 'Ban', user.id, reason);

    interaction.reply(`Banned ${user} from the server. Reason: ${reason}`);
  },
};
