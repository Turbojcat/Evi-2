// src/commands/moderation/automod.js

const { EmbedBuilder } = require('discord.js');
const { setAutoModSetting, getAutoModSettings, addWordToFilter, getWordList } = require('../../database/automoddb');

const bannedWords = [
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'dick', 'pussy', 'slut', 'whore', 'faggot', 'nigger', 'nigga',
  'chink', 'spic', 'kike', 'retard', 'fag', 'dyke', 'cock', 'dildo', 'motherfucker', 'prick', 'twat', 'wanker', 'cum',
  'jizz', 'bollocks', 'bugger', 'crap', 'damn', 'hell', 'bloody', 'arse', 'git', 'tosser', 'shag', 'shite', 'buggered',
  'bint', 'minger', 'nonce', 'pillock', 'plonker', 'prat', 'sod', 'sodding', 'tart', 'tits', 'titty', 'turd', 'wazzock',
  'willy', 'wog', 'wop', 'yid', 'zipperhead', 'coon', 'gook', 'wetback', 'beaner', 'jap', 'kraut', 'limey', 'mick',
  'paki', 'raghead', 'sandnigger', 'sheister', 'spook', 'tarbaby', 'towelhead', 'tranny', 'trannie'
];

const spamMessages = new Map();

async function checkMessageForBannedWords(message) {
  const content = message.content.toLowerCase();
  const foundWords = bannedWords.filter(word => new RegExp(`\\b${word}\\b`).test(content));

  if (foundWords.length > 0) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000') // Use a valid color value
      .setTitle('Message Deleted')
      .setDescription(`Your message contained banned words and was deleted.`)
      .addFields(
        { name: 'Banned Words', value: foundWords.join(', ') }
      )
      .setTimestamp();

    try {
      await message.delete();
      const warningMessage = await message.channel.send({ embeds: [embed] });
      setTimeout(() => warningMessage.delete(), 30000); // Delete the warning message after 30 seconds
    } catch (error) {
      console.error('Error deleting message or sending warning:', error);
    }
  }
}

async function checkMessageForSpam(message) {
  const settings = await getAutoModSettings(message.guild.id);
  if (!settings.spam_filter) return;

  const content = message.content.toLowerCase();
  const authorId = message.author.id;
  const guildId = message.guild.id;

  // Check for repeated messages
  if (!spamMessages.has(authorId)) {
    spamMessages.set(authorId, []);
  }

  const userMessages = spamMessages.get(authorId);
  userMessages.push({ content, channelId: message.channel.id, timestamp: Date.now() });

  // Remove messages older than 1 minute
  const oneMinuteAgo = Date.now() - 60000;
  spamMessages.set(authorId, userMessages.filter(msg => msg.timestamp > oneMinuteAgo));

  const repeatedMessages = userMessages.filter(msg => msg.content === content);
  const repeatedInDifferentChannels = new Set(userMessages.map(msg => msg.channelId)).size > 1;

  const isSpam = repeatedMessages.length >= 3 || repeatedInDifferentChannels || /[a-zA-Z]{3,}\d{3,}/.test(content);

  if (isSpam) {
    await message.delete();
    const embed = new EmbedBuilder()
      .setTitle('AutoMod Alert')
      .setDescription(`${message.author}, your message was detected as spam and was deleted.`)
      .setColor('#FF0000')
      .setTimestamp();

    const sentMessage = await message.channel.send({ embeds: [embed] });
    setTimeout(() => sentMessage.delete(), 30000); // Delete the embed after 30 seconds

    if (repeatedMessages.length >= 3) {
      // Timeout the user for 24 hours
      try {
        await message.member.timeout(24 * 60 * 60 * 1000, 'Repeated spam messages');
      } catch (error) {
        console.error('Error timing out user:', error);
      }
    }
  }
}

async function checkMessageForLinks(message) {
  const settings = await getAutoModSettings(message.guild.id);
  if (!settings.link_blocker) return;

  const containsLink = /https?:\/\/[^\s]+/.test(message.content);

  if (containsLink) {
    await message.delete();
    const embed = new EmbedBuilder()
      .setTitle('AutoMod Alert')
      .setDescription(`${message.author}, posting links is not allowed and your message was deleted.`)
      .setColor('#FF0000')
      .setTimestamp();

    const sentMessage = await message.channel.send({ embeds: [embed] });
    setTimeout(() => sentMessage.delete(), 30000); // Delete the embed after 30 seconds
  }
}

module.exports = {
  name: 'automod',
  description: 'Manage AutoModeration settings',
  usage: '<wordfilter|spam|link> <on|off>',
  aliases: ['am'],
  permissions: ['ADMINISTRATOR'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const action = args[1];

    if (!subcommand || !['wordfilter', 'spam', 'link'].includes(subcommand)) {
      return message.channel.send('Invalid subcommand. Use `wordfilter`, `spam`, or `link`.');
    }

    if (!action || !['on', 'off'].includes(action)) {
      return message.channel.send('Invalid action. Use `on` or `off`.');
    }

    const setting = subcommand === 'wordfilter' ? 'word_filter' : subcommand === 'spam' ? 'spam_filter' : 'link_blocker';
    const value = action === 'on';

    await setAutoModSetting(message.guild.id, setting, value);

    if (subcommand === 'wordfilter' && value) {
      for (const word of bannedWords) {
        await addWordToFilter(message.guild.id, word);
      }
    }

    message.channel.send(`AutoMod ${subcommand} has been turned ${action}.`);
  },
  checkMessageForBannedWords,
  checkMessageForSpam,
  checkMessageForLinks,
};
