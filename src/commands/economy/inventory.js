const { EmbedBuilder } = require('discord.js');
const { getInventory } = require('../../database/inventorydb');




module.exports = {
  name: 'inventory',
  description: 'View your inventory',
  usage: '',
  async execute(message, args) {
    const userId = message.author.id;
    const inventory = await getInventory(userId);

    const inventoryEmbed = new EmbedBuilder()
      .setTitle(`${message.author.username}'s Inventory`)
      .setDescription('Here is your inventory:')
      .setColor('#0099ff');

    if (inventory.length === 0) {
      inventoryEmbed.addField('Empty', 'Your inventory is currently empty.');
    } else {
      const groupedInventory = groupInventoryBySource(inventory);

      for (const [source, items] of Object.entries(groupedInventory)) {
        const itemList = items.map((item) => `${item.name} (Quantity: ${item.quantity})`).join('\n');
        inventoryEmbed.addField(source, itemList);
      }
    }

    message.channel.send({ embeds: [inventoryEmbed] });
  },
};

function groupInventoryBySource(inventory) {
  const groupedInventory = {};

  for (const item of inventory) {
    if (!groupedInventory[item.source]) {
      groupedInventory[item.source] = [];
    }
    groupedInventory[item.source].push(item);
  }

  return groupedInventory;
}
