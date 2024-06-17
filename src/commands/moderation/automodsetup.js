// src/commands/moderation/automodsetup.js
const { addWordToFilter, removeWordFromFilter, deleteWordList } = require('../../database/automoddb');

module.exports = {
  name: 'automodsetup',
  description: 'Setup AutoModeration settings for premium users',
  usage: '<wordlist|editwordlist|deleteword|deletelist> <value>',
  aliases: [],
  permissions: ['ADMINISTRATOR'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const value = args.slice(1).join(' ');

    if (!subcommand || !['wordlist', 'editwordlist', 'deleteword', 'deletelist'].includes(subcommand)) {
      return message.channel.send('Invalid subcommand. Use `wordlist`, `editwordlist`, `deleteword`, or `deletelist`.');
    }

    if (subcommand === 'wordlist') {
      const words = value.split(',').map(word => word.trim());
      for (const word of words) {
        await addWordToFilter(message.guild.id, word);
      }
      return message.channel.send('Words added to the filter list.');
    }

    if (subcommand === 'editwordlist') {
      const words = value.split(',').map(word => word.trim());
      for (const word of words) {
        await addWordToFilter(message.guild.id, word);
      }
      return message.channel.send('Words edited in the filter list.');
    }

    if (subcommand === 'deleteword') {
      const words = value.split(',').map(word => word.trim());
      for (const word of words) {
        await removeWordFromFilter(message.guild.id, word);
      }
      return message.channel.send('Words removed from the filter list.');
    }

    if (subcommand === 'deletelist') {
      await deleteWordList(message.guild.id);
      return message.channel.send('Word filter list deleted.');
    }
  },
};