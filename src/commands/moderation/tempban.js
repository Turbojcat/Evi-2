// src/commands/moderation/tempban.js
const { addModerationLog } = require('../../database/moderationdb');
const ms = require('ms');

module.exports = {
  name: 'tempban',
  description: 'Temporarily bans a user for a specified duration',
  usage: '<user> <duration> [reason]',
  permissions: ['BAN_MEMBERS'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const duration = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!user || !duration) {
      return message.channel.send('Please provide a user and duration to tempban.');
    }

    const member = message.guild.members.cache.get(user.id);
    if (member) {
      await member.ban({ reason });
    } else {
      await message.guild.members.ban(user, { reason });
    }

    setTimeout(async () => {
      await message.guild.members.unban(user);
    }, ms(duration));

    await addModerationLog(message.guild.id, message.author.id, 'Tempban', user.id, `Duration: ${duration}, Reason: ${reason}`);

    message.channel.send(`Temporarily banned ${user} for ${duration}. Reason: ${reason}`);
  },
  data: {
    name: 'tempban',
    description: 'Temporarily bans a user for a specified duration',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to tempban',
        required: true,
      },
      {
        name: 'duration',
        type: 3, // STRING
        description: 'The duration of the tempban (e.g., 1h, 30m)',
        required: true,
      },
      {
        name: 'reason',
        type: 3, // STRING
        description: 'The reason for the tempban',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = interaction.guild.members.cache.get(user.id);
    if (member) {
      await member.ban({ reason });
    } else {
      await interaction.guild.members.ban(user, { reason });
    }

    setTimeout(async () => {
      await interaction.guild.members.unban(user);
    }, ms(duration));

    await addModerationLog(interaction.guild.id, interaction.user.id, 'Tempban', user.id, `Duration: ${duration}, Reason: ${reason}`);

    interaction.reply(`Temporarily banned ${user} for ${duration}. Reason: ${reason}`);
  },
};
