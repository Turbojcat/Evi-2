// src/commands/eco/daily.js
const { addBalance, getEcoSetting } = require('../../database/ecodb');

const cooldowns = new Map();

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward (12-hour cooldown)',
  usage: '',
  aliases: [],
  permissions: [],
  cooldown: 12 * 60 * 60, // 12 hours in seconds
  execute: async (message) => {
    const userId = message.author.id;
    const guildId = message.guild.id;

    const now = Date.now();
    const cooldownAmount = module.exports.cooldown * 1000; // Convert to milliseconds

    const cooldownKey = `${guildId}_${userId}`;

    if (cooldowns.has(cooldownKey)) {
      const expirationTime = cooldowns.get(cooldownKey) + cooldownAmount;

      if (now < expirationTime) {
        return;
      }
    }

    cooldowns.set(cooldownKey, now);
    setTimeout(() => cooldowns.delete(cooldownKey), cooldownAmount);

    const dailyAmount = await getEcoSetting(guildId, 'dailyAmount', 100);
    const coinSymbol = await getEcoSetting(guildId, 'coinSymbol', '💰');

    try {
      await addBalance(guildId, userId, dailyAmount);
      message.channel.send(`${message.author}, you claimed your daily reward of ${dailyAmount} ${coinSymbol}!`);
    } catch (error) {
      console.error('Error adding daily reward:', error);
    }
  },
  data: {
    name: 'daily',
    description: 'Claim your daily reward (12-hour cooldown)',
  },
  executeSlash: async (interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const now = Date.now();
    const cooldownAmount = module.exports.cooldown * 1000; // Convert to milliseconds

    const cooldownKey = `${guildId}_${userId}`;

    if (cooldowns.has(cooldownKey)) {
      const expirationTime = cooldowns.get(cooldownKey) + cooldownAmount;

      if (now < expirationTime) {
        return interaction.followUp({ content: 'You have already claimed your daily reward. Please try again later.', ephemeral: true });
      }
    }

    cooldowns.set(cooldownKey, now);
    setTimeout(() => cooldowns.delete(cooldownKey), cooldownAmount);

    const dailyAmount = await getEcoSetting(guildId, 'dailyAmount', 100);
    const coinSymbol = await getEcoSetting(guildId, 'coinSymbol', '💰');

    try {
      await addBalance(guildId, userId, dailyAmount);
      interaction.followUp(`${interaction.user}, you claimed your daily reward of ${dailyAmount} ${coinSymbol}!`);
    } catch (error) {
      console.error('Error adding daily reward:', error);
      interaction.followUp({ content: 'An error occurred while claiming your daily reward. Please try again later.', ephemeral: true });
    }
  },
};
