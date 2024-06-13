// src/commands/utils/suggestion.js
const { EmbedBuilder } = require('discord.js');
const { suggestionChannelId } = require('../../config');
const { isSuggestionBlacklisted, createSuggestion } = require('../../database/suggestiondb');

const cooldowns = new Map();

module.exports = {
  name: 'suggestion',
  description: 'Submit a suggestion (24-hour cooldown)',
  usage: '<suggestion>',
  aliases: ['suggest'],
  permissions: [],
  cooldown: 24 * 60 * 60, // 24 hours in seconds
  execute: async (message, args) => {
    const suggestion = args.join(' ');

    if (!suggestion) {
      return;
    }

    const isBlacklisted = await isSuggestionBlacklisted(message.author.id);

    if (isBlacklisted) {
      return;
    }

    const now = Date.now();
    const cooldownAmount = module.exports.cooldown * 1000; // Convert to milliseconds

    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        return;
      }
    }

    cooldowns.set(message.author.id, now);
    setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

    try {
      await createSuggestion(message.author.id, message.guild.id, suggestion);
    } catch (error) {
      console.error('Error saving suggestion:', error);
    }
  },
  data: {
    name: 'suggestion',
    description: 'Submit a suggestion (24-hour cooldown)',
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
      return;
    }

    const now = Date.now();
    const cooldownAmount = module.exports.cooldown * 1000; // Convert to milliseconds

    if (cooldowns.has(interaction.user.id)) {
      const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        return;
      }
    }

    cooldowns.set(interaction.user.id, now);
    setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);

    try {
      await createSuggestion(interaction.user.id, interaction.guild.id, suggestion);
    } catch (error) {
      console.error('Error saving suggestion:', error);
    }
  },
};
