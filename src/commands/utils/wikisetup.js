// src/commands/utils/wikisetup.js
const { createWikiPage, removeWikiPage } = require('../../database/wiki');

module.exports = {
name: 'wikisetup',
description: 'Creates or removes a wiki page',
usage: '<add|remove> ',
aliases: ['ws'],
permissions: ['MANAGE_GUILD'],
permissionLevel: ['admin'],
execute: async (message, args) => {
const subcommand = args[0];
const page = args[1];
const channelInput = args[2];

if (!subcommand || !page || !channelInput) {
  return message.reply('Please provide a valid subcommand (add/remove), page, and channel.');
}

let channelId;
if (channelInput.startsWith('<#') && channelInput.endsWith('>')) {
  channelId = channelInput.slice(2, -1);
} else if (message.guild.channels.cache.has(channelInput)) {
  channelId = channelInput;
} else {
  const channel = message.guild.channels.cache.find(c => c.name === channelInput);
  if (channel) {
    channelId = channel.id;
  }
}

if (!channelId) {
  return message.reply('Invalid channel. Please provide a valid channel mention, ID, or name.');
}

if (subcommand === 'add') {
  const filter = m => m.author.id === message.author.id;

  try {
    await message.channel.send('Please enter the title of the wiki page:');
    const titleMessage = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const title = titleMessage.first().content;

    await message.channel.send('Please enter the description of the wiki page:');
    const descriptionMessage = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const description = descriptionMessage.first().content;

    const fields = [];
    let addMoreFields = true;

    while (addMoreFields) {
      await message.channel.send('Please enter the field title for the wiki page:');
      const fieldTitleMessage = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const fieldTitle = fieldTitleMessage.first().content;

      await message.channel.send('Please enter the field value for the wiki page:');
      const fieldValueMessage = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const fieldValue = fieldValueMessage.first().content;

      fields.push({ name: fieldTitle, value: fieldValue });

      await message.channel.send('Do you want to add more fields? (yes/no)');
      const confirmMessage = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const confirmation = confirmMessage.first().content.toLowerCase();

      if (confirmation !== 'yes') {
        addMoreFields = false;
      }
    }

    await createWikiPage(message.guild.id, page, channelId, title, description, fields);
    message.reply(`Wiki page "${page}" created successfully in <#${channelId}>.`);
  } catch (error) {
    console.error('Error creating wiki page:', error);
    message.reply('An error occurred while creating the wiki page. Please try again later.');
  }
} else if (subcommand === 'remove') {
  try {
    await removeWikiPage(message.guild.id, page);
    message.reply(`Wiki page "${page}" removed successfully.`);
  } catch (error) {
    console.error('Error removing wiki page:', error);
    message.reply('An error occurred while removing the wiki page. Please try again later.');
  }
} else {
  message.reply('Invalid subcommand. Please use "add" or "remove".');
}



},
data: {
name: 'wikisetup',
description: 'Creates or removes a wiki page',
options: [
{
name: 'add',
type: 1, // SUB_COMMAND
description: 'Adds a new wiki page',
options: [
{
name: 'page',
type: 3, // STRING
description: 'The wiki page name',
required: true,
},
{
name: 'channel',
type: 7, // CHANNEL
description: 'The channel to send the wiki page in',
required: true,
},
],
},
{
name: 'remove',
type: 1, // SUB_COMMAND
description: 'Removes a wiki page',
options: [
{
name: 'page',
type: 3, // STRING
description: 'The wiki page name',
required: true,
},
],
},
],
},
executeSlash: async (interaction) => {
const subcommand = interaction.options.getSubcommand();
const page = interaction.options.getString('page');
const channel = interaction.options.getChannel('channel');

if (subcommand === 'add') {
  const filter = m => m.author.id === interaction.user.id;

  try {
    await interaction.reply('Please enter the title of the wiki page:');
    const titleMessage = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const title = titleMessage.first().content;

    await interaction.followUp('Please enter the description of the wiki page:');
    const descriptionMessage = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const description = descriptionMessage.first().content;

    const fields = [];
    let addMoreFields = true;

    while (addMoreFields) {
      await interaction.followUp('Please enter the field title for the wiki page:');
      const fieldTitleMessage = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const fieldTitle = fieldTitleMessage.first().content;

      await interaction.followUp('Please enter the field value for the wiki page:');
      const fieldValueMessage = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const fieldValue = fieldValueMessage.first().content;

      fields.push({ name: fieldTitle, value: fieldValue });

      await interaction.followUp('Do you want to add more fields? (yes/no)');
      const confirmMessage = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const confirmation = confirmMessage.first().content.toLowerCase();

      if (confirmation !== 'yes') {
        addMoreFields = false;
      }
    }

    await createWikiPage(interaction.guild.id, page, channel.id, title, description, fields);
    interaction.followUp(`Wiki page "${page}" created successfully in <#${channel.id}>.`);
  } catch (error) {
    console.error('Error creating wiki page:', error);
    interaction.followUp('An error occurred while creating the wiki page. Please try again later.');
  }
} else if (subcommand === 'remove') {
  try {
    await removeWikiPage(interaction.guild.id, page);
    interaction.reply(`Wiki page "${page}" removed successfully.`);
  } catch (error) {
    console.error('Error removing wiki page:', error);
    interaction.reply('An error occurred while removing the wiki page. Please try again later.');
  }
}



},
};