// src/commands/utils/copycategory.js
const { PermissionsBitField } = require('discord.js');
const { hasPremiumSubscription } = require('../../database/database');

module.exports = {
  name: 'copycategory',
  description: 'Creates a new category with the same permissions as the source category (premium only)',
  usage: '<source-category-id>',
  aliases: ['copycat', 'copyc'],
  permissions: ['MANAGE_CHANNELS'],
  premium: true,
  execute: async (message, args) => {
    const isPremium = await hasPremiumSubscription(message.author.id);
    if (!isPremium) {
      return message.reply('This command is only available for premium users.');
    }

    const sourceCategoryId = args[0];
    console.log('Source Category ID:', sourceCategoryId);

    if (!sourceCategoryId) {
      return message.reply('Please provide the source category ID.');
    }

    const sourceCategory = message.guild.channels.cache.get(sourceCategoryId);
    console.log('Source Category (get):', sourceCategory);

    const categories = message.guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY');
    console.log('Categories:', categories.map(category => ({ id: category.id, name: category.name })));

    if (!sourceCategory) {
      return message.reply('Invalid source category ID. Please provide a valid category ID.');
    }

    console.log('Source Category Name:', sourceCategory.name);

    try {
      const newCategory = await sourceCategory.clone();
      message.reply(`New category "${newCategory.name}" created with the same permissions as "${sourceCategory.name}".`);
    } catch (error) {
      console.error('Error creating category:', error);
      message.reply('An error occurred while creating the category. Please check the provided category ID and try again.');
    }
  },
  data: {
    name: 'copycategory',
    description: 'Creates a new category with the same permissions as the source category (premium only)',
    options: [
      {
        name: 'source-category',
        type: 7, // CHANNEL
        description: 'The source category to copy permissions from',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const isPremium = await hasPremiumSubscription(interaction.user.id);
    if (!isPremium) {
      return interaction.reply({ content: 'This command is only available for premium users.', ephemeral: true });
    }

    const sourceCategory = interaction.options.getChannel('source-category');
    console.log('Source Category (Slash):', sourceCategory);

    if (!sourceCategory || sourceCategory.type !== 'GUILD_CATEGORY') {
      return interaction.reply({ content: 'Invalid source category. Please provide a valid category.', ephemeral: true });
    }

    console.log('Source Category Name (Slash):', sourceCategory.name);

    try {
      const newCategory = await sourceCategory.clone();
      interaction.reply(`New category "${newCategory.name}" created with the same permissions as "${sourceCategory.name}".`);
    } catch (error) {
      console.error('Error creating category (Slash):', error);
      interaction.reply({ content: 'An error occurred while creating the category. Please check the provided category and try again.', ephemeral: true });
    }
  },
};
