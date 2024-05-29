// src/commands/utils/wiki.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWikiPages, createWikiPage, removeWikiPage } = require('../../database/wiki');

const wiki = {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Manage and view wiki pages')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View a wiki page')
        .addStringOption(option =>
          option.setName('page')
            .setDescription('The name of the wiki page to view')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new wiki page')
        .addStringOption(option =>
          option.setName('page')
            .setDescription('The name of the wiki page to create')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('title')
            .setDescription('The title of the wiki page')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('description')
            .setDescription('The description of the wiki page')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a wiki page')
        .addStringOption(option =>
          option.setName('page')
            .setDescription('The name of the wiki page to delete')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const page = interaction.options.getString('page');

    if (subcommand === 'view') {
      const wikiPages = await getWikiPages(interaction.guildId);
      const wikiPage = wikiPages.find(p => p.page === page);

      if (!wikiPage) {
        return interaction.reply(`The wiki page "${page}" does not exist.`);
      }

      const { title, description, fields } = wikiPage;
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .addFields(fields);

      return interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');

      await createWikiPage(interaction.guildId, page, interaction.channelId, title, description, []);
      return interaction.reply(`Wiki page "${page}" has been created.`);
    } else if (subcommand === 'delete') {
      const wikiPages = await getWikiPages(interaction.guildId);
      const wikiPage = wikiPages.find(p => p.page === page);

      if (!wikiPage) {
        return interaction.reply(`The wiki page "${page}" does not exist.`);
      }

      await removeWikiPage(interaction.guildId, page);
      return interaction.reply(`Wiki page "${page}" has been deleted.`);
    }
  },
};

module.exports = wiki;
