// src/commands/utils/wikisetup.js
const { createWikiPage, removeWikiPage } = require('../../database/wiki');

module.exports = {
  name: 'wikisetup',
  description: 'Creates or removes a wiki page',
  usage: '<add|remove> <page> [text]',
  aliases: ['ws'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const page = args[1];
    const text = args.slice(2).join(' ');

    if (!subcommand || !page) {
      return message.channel.send('Please provide a valid subcommand (add/remove) and page.');
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

        const wikiChannel = await getWikiChannel(message.guild.id);
        if (!wikiChannel) {
          return message.channel.send('No wiki channel is set. Please set a wiki channel using the `wikichannel` command.');
        }

        await createWikiPage(message.guild.id, page, wikiChannel, title, description, fields, text);
        message.channel.send(`Wiki page "${page}" created successfully in <#${wikiChannel}>.`);
      } catch (error) {
        message.channel.send('An error occurred while creating the wiki page. Please try again later.');
      }
    } else if (subcommand === 'remove') {
      try {
        await removeWikiPage(message.guild.id, page);
        message.channel.send(`Wiki page "${page}" removed successfully.`);
      } catch (error) {
        message.channel.send('An error occurred while removing the wiki page. Please try again later.');
      }
    } else {
      message.channel.send('Invalid subcommand. Please use "add" or "remove".');
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
            name: 'text',
            type: 3, // STRING
            description: 'The text content of the wiki page',
            required: false,
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
    const text = interaction.options.getString('text');

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

        const wikiChannel = await getWikiChannel(interaction.guild.id);
        if (!wikiChannel) {
          return interaction.followUp('No wiki channel is set. Please set a wiki channel using the `wikichannel` command.');
        }

        await createWikiPage(interaction.guild.id, page, wikiChannel, title, description, fields, text);
        interaction.followUp(`Wiki page "${page}" created successfully in <#${wikiChannel}>.`);
      } catch (error) {
        interaction.followUp('An error occurred while creating the wiki page. Please try again later.');
      }
    } else if (subcommand === 'remove') {
      try {
        await removeWikiPage(interaction.guild.id, page);
        interaction.followUp(`Wiki page "${page}" removed successfully.`);
      } catch (error) {
        interaction.followUp('An error occurred while removing the wiki page. Please try again later.');
      }
    }
  },
};
