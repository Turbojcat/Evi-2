// src/commands/moderation/mute.js
const { addMute, addModerationLog } = require('../../database/moderationdb');
const ms = require('ms');

module.exports = {
  name: 'mute',
  description: 'Mutes a user for a specified duration',
  usage: '<user> <duration>',
  permissions: ['MUTE_MEMBERS'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const duration = args[1];

    if (!user || !duration) {
      return message.channel.send('Please provide a user and duration to mute.');
    }

    const expirationTime = Date.now() + ms(duration);
    await addMute(message.guild.id, user.id, expirationTime);
    await addModerationLog(message.guild.id, message.author.id, 'Mute', user.id, `Duration: ${duration}`);

    message.channel.send(`Muted ${user} for ${duration}.`);
  },
  data: {
    name: 'mute',
    description: 'Mutes a user for a specified duration',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to mute',
        required: true,
      },
      {
        name: 'duration',
        type: 3, // STRING
        description: 'The duration of the mute (e.g., 1h, 30m)',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');

    const expirationTime = Date.now() + ms(duration);
    await addMute(interaction.guild.id, user.id, expirationTime);
    await addModerationLog(interaction.guild.id, interaction.user.id, 'Mute', user.id, `Duration: ${duration}`);

    interaction.reply(`Muted ${user} for ${duration}.`);
  },
};
