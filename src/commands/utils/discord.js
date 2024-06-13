// src/commands/utils/discord.js
const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../../config');

module.exports = {
  name: 'discord',
  description: 'Displays the invite link to Evi\'s support server',
  usage: '',
  aliases: ['support'],
  permissions: [],
  execute: async (message) => {
    if (!message.content.startsWith(prefix)) return;
    await executeCommand(message);
  },
  data: {
    name: 'discord',
    description: 'Displays the invite link to Evi\'s support server',
  },
  executeSlash: async (interaction) => {
    await executeCommand(interaction);
  },
};

async function executeCommand(interactionOrMessage) {
  const embed = new EmbedBuilder()
    .setTitle('Evi\'s Support Server')
    .setDescription('Evi\'s support server: Join for support, updates, and suggestions. Join Evi\'s friendly community!\n\n[Click here to join the server](https://discord.gg/6tnqjeRach)')
    .setThumbnail('https://cdn.discordapp.com/attachments/1243553220387803206/1243553264494968923/03cb6922d5bd77418daa85e22319ca08ef5c713a.jpg?ex=6651e4ba&is=6650933a&hm=6db433b5cd1e907c10e9c5d065e6c3853abb8bb9ef40f9687cb711b4df2def77&')
    .setTimestamp();

  if (interactionOrMessage.reply) {
    await interactionOrMessage.channel.send({ embeds: [embed] });
  } else {
    await interactionOrMessage.channel.send({ embeds: [embed] });
  }
}
