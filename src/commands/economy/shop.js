const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getShopCategories, getShopItems, getRoles, getItemsByCategory, getRolesByCategory, buyItem, buyRole, sellItem, sellRole } = require('../../database/shopdb');
const { addItem, removeItem } = require('../../database/inventorydb');

module.exports = {
  name: 'shop',
  description: 'View and interact with the shop',
  usage: '',
  async execute(message, args) {
    const guildId = message.guild.id;
    const userId = message.author.id;

    const categories = await getShopCategories(guildId);
    const items = await getShopItems(guildId);
    const roles = await getRoles(guildId);

    let currentPage = 0;
    const itemsPerPage = 10;

    const shopEmbed = new EmbedBuilder()
      .setTitle('Shop')
      .setDescription('Welcome to the shop! Browse the available items and roles.')
      .setColor('#0099ff');

    const updateShopEmbed = async () => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const displayedItems = items.slice(startIndex, endIndex);
      const displayedRoles = roles.slice(startIndex, endIndex);

      const itemFields = displayedItems.map((item) => ({
        name: item.name,
        value: `Price: ${item.price}\nDescription: ${item.description}`,
        inline: true,
      }));

      const roleFields = displayedRoles.map((role) => ({
        name: role.name,
        value: `Price: ${role.price}\nDescription: ${role.description}`,
        inline: true,
      }));

      shopEmbed.fields = [];
      shopEmbed.addFields(...itemFields, ...roleFields);

      const components = [];

      const categoryButtons = categories.map((category) => (
        new ButtonBuilder()
          .setCustomId(`viewCategory_${category.id}`)
          .setLabel(category.name)
          .setStyle(ButtonStyle.Primary)
      ));

      const navigationButtons = [];

      if (currentPage > 0) {
        navigationButtons.push(
          new ButtonBuilder()
            .setCustomId('previousPage')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
        );
      }

      if (endIndex < items.length || endIndex < roles.length) {
        navigationButtons.push(
          new ButtonBuilder()
            .setCustomId('nextPage')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
        );
      }

      if (categoryButtons.length > 0) {
        components.push(new ActionRowBuilder().addComponents(categoryButtons));
      }

      if (navigationButtons.length > 0) {
        components.push(new ActionRowBuilder().addComponents(navigationButtons));
      }

      if (displayedItems.length > 0) {
        const buyItemButtons = displayedItems.map((item) => (
          new ButtonBuilder()
            .setCustomId(`buyItem_${item.id}`)
            .setLabel('Buy')
            .setStyle(ButtonStyle.Success)
        ));

        const sellItemButtons = displayedItems.map((item) => (
          new ButtonBuilder()
            .setCustomId(`sellItem_${item.id}`)
            .setLabel('Sell')
            .setStyle(ButtonStyle.Danger)
        ));

        components.push(new ActionRowBuilder().addComponents(buyItemButtons));
        components.push(new ActionRowBuilder().addComponents(sellItemButtons));
      }

      if (displayedRoles.length > 0) {
        const buyRoleButtons = displayedRoles.map((role) => (
          new ButtonBuilder()
            .setCustomId(`buyRole_${role.id}`)
            .setLabel('Buy')
            .setStyle(ButtonStyle.Success)
        ));

        const sellRoleButtons = displayedRoles.map((role) => (
          new ButtonBuilder()
            .setCustomId(`sellRole_${role.id}`)
            .setLabel('Sell')
            .setStyle(ButtonStyle.Danger)
        ));

        components.push(new ActionRowBuilder().addComponents(buyRoleButtons));
        components.push(new ActionRowBuilder().addComponents(sellRoleButtons));
      }

      return { embeds: [shopEmbed], components };
    };

    const { embeds, components } = await updateShopEmbed();
    const sentMessage = await message.channel.send({ embeds, components });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId.startsWith('viewCategory_')) {
        const categoryId = interaction.customId.split('_')[1];
        const categoryItems = await getItemsByCategory(guildId, categoryId);
        const categoryRoles = await getRolesByCategory(guildId, categoryId);

        currentPage = 0;
        items.length = 0;
        roles.length = 0;
        items.push(...categoryItems);
        roles.push(...categoryRoles);

        const { embeds, components } = await updateShopEmbed();
        await interaction.update({ embeds, components });
      } else if (interaction.customId === 'previousPage') {
        currentPage--;
        const { embeds, components } = await updateShopEmbed();
        await interaction.update({ embeds, components });
      } else if (interaction.customId === 'nextPage') {
        currentPage++;
        const { embeds, components } = await updateShopEmbed();
        await interaction.update({ embeds, components });
      } else if (interaction.customId.startsWith('buyItem_')) {
        const itemId = interaction.customId.split('_')[1];
        const item = items.find((item) => item.id === parseInt(itemId));

        if (item) {
          const success = await buyItem(userId, item.id);
          if (success) {
            await addItem(userId, item.id, 1);
            await interaction.reply(`You have successfully purchased the item "${item.name}".`);
          } else {
            await interaction.reply('You do not have enough coins to buy this item.');
          }
        }
      } else if (interaction.customId.startsWith('buyRole_')) {
        const roleId = interaction.customId.split('_')[1];
        const role = roles.find((role) => role.id === parseInt(roleId));

        if (role) {
          const guildRole = message.guild.roles.cache.get(role.roleId);
          if (guildRole) {
            const success = await buyRole(userId, role.id);
            if (success) {
              await interaction.member.roles.add(guildRole);
              await interaction.reply(`You have successfully purchased the role "${role.name}".`);
            } else {
              await interaction.reply('You do not have enough coins to buy this role.');
            }
          } else {
            await interaction.reply('The role does not exist in this server.');
          }
        }
      } else if (interaction.customId.startsWith('sellItem_')) {
        const itemId = interaction.customId.split('_')[1];
        const item = items.find((item) => item.id === parseInt(itemId));

        if (item) {
          const success = await sellItem(userId, item.id);
          if (success) {
            await removeItem(userId, item.id, 1);
            await interaction.reply(`You have successfully sold the item "${item.name}".`);
          } else {
            await interaction.reply('You do not have this item in your inventory.');
          }
        }
      } else if (interaction.customId.startsWith('sellRole_')) {
        const roleId = interaction.customId.split('_')[1];
        const role = roles.find((role) => role.id === parseInt(roleId));

        if (role) {
          const guildRole = message.guild.roles.cache.get(role.roleId);
          if (guildRole) {
            const success = await sellRole(userId, role.id);
            if (success) {
              await interaction.member.roles.remove(guildRole);
              await interaction.reply(`You have successfully sold the role "${role.name}".`);
            } else {
              await interaction.reply('You do not have this role.');
            }
          } else {
            await interaction.reply('The role does not exist in this server.');
          }
        }
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] });
    });
  },
};
