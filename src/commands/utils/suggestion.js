// src/commands/utils/suggestion.js
const { EmbedBuilder } = require('discord.js');
const { suggestionChannelId } = require('../../config');
const { isSuggestionBlacklisted, createSuggestion } = require('../../database/suggestiondb');

module.exports = {
  name: 'suggestion',
  description: 'Submit a suggestion',
  usage: '<suggestion>',
  aliases: ['suggest'],
  permissions: [],
  execute: async (message, args) => {
    const suggestion = args.join(' ');

    if (!suggestion) {
      return message.channel.send('Please provide a suggestion.');
    }

    const isBlacklisted = await isSuggestionBlacklisted(message.author.id);

    if (isBlacklisted) {
      return message.channel.send('You are blacklisted from submitting suggestions.');
    }

    try {
      await createSuggestion(message.author.id, message.guild.id, suggestion);
      message.channel.send('Your suggestion has been submitted. Thank you!');
    } catch (error) {
      console.error('Error saving suggestion:', error);
      message.channel.send('An error occurred while submitting your suggestion. Please try again later.');
    }
  },
  data: {
    name: 'suggestion',
    description: 'Submit a suggestion',
    options: [
      {
        name: 'suggestion',
        type: 3, // STRING
        description: 'The suggestion text',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const suggestion = interaction.options.getString('suggestion');
    const isBlacklisted = await isSuggestionBlacklisted(interaction.user.id);

    if (isBlacklisted) {
      return interaction.reply({ content: 'You are blacklisted from submitting suggestions.', ephemeral: true });
    }

    try {
      await createSuggestion(interaction.user.id, interaction.guild.id, suggestion);
      interaction.reply({ content: 'Your suggestion has been submitted. Thank you!', ephemeral: true });
    } catch (error) {
      console.error('Error saving suggestion:', error);
      interaction.reply({ content: 'An error occurred while submitting your suggestion. Please try again later.', ephemeral: true });
    }
  },
};
