// src/commands/moderation/clearwarns.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { addModerationLog, clearWarnings } = require('../../database/moderationdb');

module.exports = {
  name: 'clearwarns',
  description: 'Clears all warnings for a user',
  usage: '<user>',
  permissions: ['MANAGE_MESSAGES'],
  permissionLevel: ['moderator'],
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clears all warnings for a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to clear warnings for')
        .setRequired(true)
    ),
  execute: async (message, args) => {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);

    if (!user) {
      return message.channel.send('Please mention a valid user or provide a valid user ID.');
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.channel.send('You do not have permission to use this command.');
    }

    try {
      await clearWarnings(message.guild.id, user.id);
      await addModerationLog(message.guild.id, message.author.id, 'clearwarns', user.id, 'Cleared all warnings');
      message.channel.send(`Cleared all warnings for ${user.tag}.`);
    } catch (error) {
      console.error('Error clearing warnings:', error);
      message.channel.send('An error occurred while clearing warnings. Please try again later.');
    }
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');

    if (!user) {
      return interaction.reply({ content: 'Please provide a valid user.', ephemeral: true });
    }

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
      await clearWarnings(interaction.guild.id, user.id);
      await addModerationLog(interaction.guild.id, interaction.user.id, 'clearwarns', user.id, 'Cleared all warnings');
      await interaction.reply(`Cleared all warnings for ${user.tag}.`);
    } catch (error) {
      console.error('Error clearing warnings:', error);
      await interaction.reply({ content: 'An error occurred while clearing warnings. Please try again later.', ephemeral: true });
    }
  },
};
