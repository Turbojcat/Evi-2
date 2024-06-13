// src/commands/utils/wiki.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require('discord.js');
const { getWikiPages } = require('../../database/wiki');

module.exports = {
  name: 'wiki',
  description: 'View and manage wiki pages',
  usage: '[page|list]',
  aliases: [],
  permissions: [],
  execute: async (message, args) => {
    const subcommand = args[0];

    if (subcommand === 'list') {
      const wikiPages = await getWikiPages(message.guild.id);

      if (wikiPages.length === 0) {
        return message.channel.send('There are no wiki pages available.');
      }

      const embed = new EmbedBuilder()
        .setTitle('Wiki Pages')
        .setDescription('Here is a list of all available wiki pages:')
        .addFields(
          wikiPages.map((page, index) => ({
            name: `${index + 1}. ${page.title}`,
            value: `Page: ${page.page}`,
          }))
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } else {
      let page = parseInt(subcommand) || 1;

      const wikiPages = await getWikiPages(message.guild.id);

      if (wikiPages.length === 0) {
        return message.channel.send('There are no wiki pages available.');
      }

      const sendWikiPage = async (pageNumber, reply) => {
        const wikiPage = wikiPages[pageNumber - 1];

        if (!wikiPage) {
          if (pageNumber < 1) {
            pageNumber = 1;
          } else {
            pageNumber = wikiPages.length;
          }
          return await sendWikiPage(pageNumber, reply);
        }

        const { title, description, fields } = wikiPage;
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .addFields(fields)
          .setFooter({ text: `Page ${pageNumber} of ${wikiPages.length}` })
          .setTimestamp();

        const components = [];

        if (pageNumber > 1) {
          components.push(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('Previous')
              .setStyle(ButtonStyle.Primary)
          );
        }

        if (pageNumber < wikiPages.length) {
          components.push(
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next')
              .setStyle(ButtonStyle.Primary)
          );
        }

        const row = new ActionRowBuilder().addComponents(components);

        if (reply) {
          await reply.edit({ embeds: [embed], components: [row] });
        } else {
          reply = await message.channel.send({ embeds: [embed], components: [row] });
        }

        return { pageNumber, reply };
      };

      const { pageNumber, reply } = await sendWikiPage(page);

      let collector;
      if (reply instanceof Message) {
        collector = reply.createMessageComponentCollector({ componentType: 2, time: 60000 });
      } else {
        collector = reply.createMessageComponentCollector({ componentType: 2, time: 60000 });
      }

      collector.on('collect', async (interaction) => {
        try {
          if (interaction.customId === 'previous') {
            const { pageNumber } = await sendWikiPage(page - 1, reply);
            page = pageNumber;
          } else if (interaction.customId === 'next') {
            const { pageNumber } = await sendWikiPage(page + 1, reply);
            page = pageNumber;
          }
          await interaction.update({});
        } catch (error) {
          console.error('Error handling button interaction:', error);
          // Handle the error gracefully, e.g., send an error message to the user
        }
      });

      collector.on('end', async () => {
        if (reply instanceof Message) {
          await reply.edit({ components: [] });
        } else {
          await reply.update({ components: [] });
        }
      });
    }
  },
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('View and manage wiki pages')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View a specific wiki page')
        .addIntegerOption((option) =>
          option
            .setName('page')
            .setDescription('The page number of the wiki page to view')
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all available wiki pages')
    ),
  async executeSlash(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const wikiPages = await getWikiPages(interaction.guild.id);

      if (wikiPages.length === 0) {
        return interaction.reply('There are no wiki pages available.');
      }

      const embed = new EmbedBuilder()
        .setTitle('Wiki Pages')
        .setDescription('Here is a list of all available wiki pages:')
        .addFields(
          wikiPages.map((page, index) => ({
            name: `${index + 1}. ${page.title}`,
            value: `Page: ${page.page}`,
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      let page = interaction.options.getInteger('page') || 1;

      const wikiPages = await getWikiPages(interaction.guild.id);

      if (wikiPages.length === 0) {
        return interaction.reply('There are no wiki pages available.');
      }

      const sendWikiPage = async (pageNumber, reply) => {
        const wikiPage = wikiPages[pageNumber - 1];

        if (!wikiPage) {
          if (pageNumber < 1) {
            pageNumber = 1;
          } else {
            pageNumber = wikiPages.length;
          }
          return await sendWikiPage(pageNumber, reply);
        }

        const { title, description, fields } = wikiPage;
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .addFields(fields)
          .setFooter({ text: `Page ${pageNumber} of ${wikiPages.length}` })
          .setTimestamp();

        const components = [];

        if (pageNumber > 1) {
          components.push(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('Previous')
              .setStyle(ButtonStyle.Primary)
          );
        }

        if (pageNumber < wikiPages.length) {
          components.push(
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next')
              .setStyle(ButtonStyle.Primary)
          );
        }

        const row = new ActionRowBuilder().addComponents(components);

        if (reply) {
          await reply.edit({ embeds: [embed], components: [row] });
        } else {
          reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        }

        return { pageNumber, reply };
      };

      const { pageNumber, reply } = await sendWikiPage(page);

      let collector;
      if (reply instanceof Message) {
        collector = reply.createMessageComponentCollector({ componentType: 2, time: 60000 });
      } else {
        collector = reply.createMessageComponentCollector({ componentType: 2, time: 60000 });
      }

      collector.on('collect', async (buttonInteraction) => {
        try {
          if (buttonInteraction.customId === 'previous') {
            const { pageNumber } = await sendWikiPage(page - 1, reply);
            page = pageNumber;
          } else if (buttonInteraction.customId === 'next') {
            const { pageNumber } = await sendWikiPage(page + 1, reply);
            page = pageNumber;
          }
          await buttonInteraction.update({});
        } catch (error) {
          console.error('Error handling button interaction:', error);
          // Handle the error gracefully, e.g., send an error message to the user
        }
      });

      collector.on('end', async () => {
        if (reply instanceof Message) {
          await reply.edit({ components: [] });
        } else {
          await reply.update({ components: [] });
        }
      });
    }
  },
};
