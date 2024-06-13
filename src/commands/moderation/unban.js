// src/commands/moderation/unban.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'unban',
  description: 'Unbans a previously banned user',
  usage: '<user>',
  permissions: ['BAN_MEMBERS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const userId = args[0];

    if (!userId) {
      return message.channel.send('Please provide a user ID to unban.');
    }

    try {
      const user = await message.client.users.fetch(userId);
      await message.guild.members.unban(user);
      await addModerationLog(message.guild.id, message.author.id, 'Unban', user.id);

      message.channel.send(`Unbanned ${user} from the server.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      message.channel.send('An error occurred while unbanning the user.');
    }
  },
  data: {
    name: 'unban',
    description: 'Unbans a previously banned user',
    options: [
      {
        name: 'user',
        type: 3, // STRING
        description: 'The ID of the user to unban',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const userId = interaction.options.getString('user');

    try {
      const user = await interaction.client.users.fetch(userId);
      await interaction.guild.members.unban(user);
      await addModerationLog(interaction.guild.id, interaction.user.id, 'Unban', user.id);

      interaction.reply(`Unbanned ${user} from the server.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      interaction.reply('An error occurred while unbanning the user.');
    }
  },
};
