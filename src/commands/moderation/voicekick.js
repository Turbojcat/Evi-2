// src/commands/moderation/voicekick.js
const { addModerationLog } = require('../../database/moderationdb');

module.exports = {
  name: 'voicekick',
  description: 'Kicks a user from a voice channel',
  usage: '<user>',
  permissions: ['MOVE_MEMBERS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.send('Please provide a user to voice kick.');
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.channel.send('User not found in the server.');
    }

    if (!member.voice.channel) {
      return message.channel.send('User is not in a voice channel.');
    }

    await member.voice.disconnect();
    await addModerationLog(message.guild.id, message.author.id, 'Voice Kick', user.id);

    message.channel.send(`Kicked ${user} from the voice channel.`);
  },
  data: {
    name: 'voicekick',
    description: 'Kicks a user from a voice channel',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to voice kick',
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

    if (!member.voice.channel) {
      return interaction.reply('User is not in a voice channel.');
    }

    await member.voice.disconnect();
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Voice Kick', user.id);

    interaction.reply(`Kicked ${user} from the voice channel.`);
  },
};
