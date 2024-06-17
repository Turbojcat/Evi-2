// src/commands/moderation/voiceban.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'voiceban',
  description: 'Bans a user from joining voice channels',
  usage: '<user>',
  permissions: ['BAN_MEMBERS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.send('Please provide a user to voice ban.');
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.channel.send('User not found in the server.');
    }

    await member.voice.setMute(true);
    await addModerationLog(message.guild.id, message.author.id, 'Voice Ban', user.id);

    message.channel.send(`Banned ${user} from joining voice channels.`);
  },
  data: {
    name: 'voiceban',
    description: 'Bans a user from joining voice channels',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to voice ban',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply('User not found in the server.');
    }

    await member.voice.setMute(true);
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Voice Ban', user.id);

    interaction.reply(`Banned ${user} from joining voice channels.`);
  },
};
