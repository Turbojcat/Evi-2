const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addShopCategory, addShopItem, addShopRole, setItemPrice, setRolePrice, getCategoryCount, getItemCount, getRoleCount, getShopItems, getRoles } = require('../../database/shopdb');

module.exports = {
  name: 'shopsetup',
  description: 'Set up the shop',
  usage: '',
  permissions: ['ADMINISTRATOR'],
  async execute(message, args) {
    const guildId = message.guild.id;
    const isPremium = true; // Replace with your own logic to determine if the guild has premium access

    const categoryLimit = isPremium ? 10 : 5;
    const itemRoleLimit = isPremium ? 50 : 20;

    const embed = new EmbedBuilder()
      .setTitle('Shop Setup')
      .setDescription('Use the buttons below to set up the shop.')
      .setColor('#0099ff');

    const row = new ActionRowBuilder();

    const categoryCount = await getCategoryCount(guildId);
    if (categoryCount < categoryLimit) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('addCategory')
          .setLabel('Add Category')
          .setStyle(ButtonStyle.Primary)
      );
    }

    const itemCount = await getItemCount(guildId);
    if (itemCount < itemRoleLimit) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('addItem')
          .setLabel('Add Item')
          .setStyle(ButtonStyle.Primary)
      );
    }

    const roleCount = await getRoleCount(guildId);
    if (roleCount < itemRoleLimit) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('addRole')
          .setLabel('Add Role')
          .setStyle(ButtonStyle.Primary)
      );
    }

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('sellItem')
        .setLabel('Sell Item')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('sellRole')
        .setLabel('Sell Role')
        .setStyle(ButtonStyle.Primary)
    );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      try {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.customId === 'addCategory') {
          const categoryName = await askQuestion(interaction, 'Enter the category name:');
          if (categoryName) {
            await addShopCategory(guildId, categoryName);
            await interaction.editReply(`Category "${categoryName}" has been added to the shop.`);
          }
        } else if (interaction.customId === 'addItem') {
          const itemName = await askQuestion(interaction, 'Enter the item name:');
          const itemDescription = await askQuestion(interaction, 'Enter the item description:');
          const itemPrice = await askQuestion(interaction, 'Enter the item price:');

          if (itemName && itemDescription && itemPrice) {
            await addShopItem(guildId, null, itemName, itemDescription, parseInt(itemPrice), null);
            await interaction.editReply(`Item "${itemName}" has been added to the shop.`);
          }
        } else if (interaction.customId === 'addRole') {
          const roleName = await askQuestion(interaction, 'Enter the role name:');
          const roleDescription = await askQuestion(interaction, 'Enter the role description:');
          const rolePrice = await askQuestion(interaction, 'Enter the role price:');
          const roleId = await askQuestion(interaction, 'Enter the role ID:');

          if (roleName && roleDescription && rolePrice && roleId) {
            await addShopRole(guildId, null, roleName, roleDescription, parseInt(rolePrice), roleId);
            await interaction.editReply(`Role "${roleName}" has been added to the shop.`);
          }
        } else if (interaction.customId === 'sellItem') {
          const itemName = await askQuestion(interaction, 'Enter the item name:');
          const itemPrice = await askQuestion(interaction, 'Enter the sell price:');

          if (itemName && itemPrice) {
            const item = await getItemByName(guildId, itemName);
            if (item) {
              await setItemPrice(item.id, parseInt(itemPrice));
              await interaction.editReply(`Item "${itemName}" can now be sold for ${itemPrice} coins.`);
            } else {
              await interaction.editReply(`Item "${itemName}" not found in the shop.`);
            }
          }
        } else if (interaction.customId === 'sellRole') {
          const roleName = await askQuestion(interaction, 'Enter the role name:');
          const rolePrice = await askQuestion(interaction, 'Enter the sell price:');

          if (roleName && rolePrice) {
            const role = await getRoleByName(guildId, roleName);
            if (role) {
              await setRolePrice(role.id, parseInt(rolePrice));
              await interaction.editReply(`Role "${roleName}" can now be sold for ${rolePrice} coins.`);
            } else {
              await interaction.editReply(`Role "${roleName}" not found in the shop.`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling interaction:', error);
        if (!interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
        }
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] });
    });
  },
};

async function askQuestion(interaction, question) {
  await interaction.followUp({ content: question, ephemeral: true });
  const response = await interaction.channel.awaitMessages({
    filter: (m) => m.author.id === interaction.user.id,
    max: 1,
    time: 30000,
    errors: ['time'],
  });

  const answer = response.first().content;
  return answer;
}

async function getItemByName(guildId, itemName) {
  const items = await getShopItems(guildId);
  return items.find((item) => item.name.toLowerCase() === itemName.toLowerCase());
}

async function getRoleByName(guildId, roleName) {
  const roles = await getRoles(guildId);
  return roles.find((role) => role.name.toLowerCase() === roleName.toLowerCase());
}
