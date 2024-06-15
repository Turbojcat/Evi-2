const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shopinfo',
  description: 'Displays information about the shop system',
  usage: '',
  async execute(message, args) {
    const shopInfoEmbed = new EmbedBuilder()
      .setTitle('Shop System Information')
      .setDescription('Here is a detailed guide on how to use the shop system:')
      .setColor('#0099ff')
      .addFields(
        {
          name: 'Shop Setup',
          value: `
            - Use the \`/shopsetup\` command to set up the shop.
            - Click on the "Add Category" button to create a new category for the shop.
            - Click on the "Add Item" button to add a new item to the shop.
            - Click on the "Add Role" button to add a new role to the shop.
            - Click on the "Sell Item" button to set the sell price for an item.
            - Click on the "Sell Role" button to set the sell price for a role.
          `,
        },
        {
          name: 'Shop Limits',
          value: `
            - Free tier:
              - Maximum of 5 categories
              - Maximum of 20 items/roles
              - Maximum of 20 items/roles for selling
            - Premium tier:
              - Maximum of 10 categories
              - Maximum of 50 items/roles
              - Maximum of 50 items/roles for selling
          `,
        },
        {
          name: 'Browsing the Shop',
          value: `
            - Use the \`/shop\` command to view the shop.
            - The shop will display available items and roles.
            - Click on the category buttons to view items/roles in a specific category.
            - Use the "Previous" and "Next" buttons to navigate through pages.
          `,
        },
        {
          name: 'Buying from the Shop',
          value: `
            - Click on the "Buy" button next to an item or role to purchase it.
            - The cost of the item/role will be deducted from your balance.
            - Purchased items will be added to your inventory.
            - Purchased roles will be assigned to you.
          `,
        },
        {
          name: 'Selling to the Shop',
          value: `
            - Click on the "Sell" button next to an item or role to sell it.
            - The sell price of the item/role will be added to your balance.
            - Sold items will be removed from your inventory.
            - Sold roles will be unassigned from you.
          `,
        },
        {
          name: 'Inventory',
          value: `
            - Use the \`/inventory\` command to view your inventory.
            - The inventory will display items you have purchased from the shop.
            - Items in the inventory are grouped by their source (e.g., shop, work, etc.).
          `,
        }
      );

    message.channel.send({ embeds: [shopInfoEmbed] });
  },
};
