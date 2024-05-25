// src/commands/utils/evi.js
const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../../config');

module.exports = {
  name: 'evi',
  description: 'Displays information about Evi',
  usage: '',
  aliases: [],
  permissions: [],
  execute: async (message) => {
    if (!message.content.startsWith(prefix)) return;
    await executeCommand(message);
  },
  data: {
    name: 'evi',
    description: 'Displays information about Evi',
  },
  executeSlash: async (interaction) => {
    await executeCommand(interaction);
  },
};

async function executeCommand(interactionOrMessage) {
  const imageEmbed = new EmbedBuilder()
    .setImage('https://cdn.discordapp.com/attachments/1243553220387803206/1243553264494968923/03cb6922d5bd77418daa85e22319ca08ef5c713a.jpg?ex=6651e4ba&is=6650933a&hm=6db433b5cd1e907c10e9c5d065e6c3853abb8bb9ef40f9687cb711b4df2def77&');

  const infoEmbed = new EmbedBuilder()
    .setTitle('Evi\'s Life')
    .setDescription('Evi, a charming and lively young girl of 18, has a unique and captivating appearance. With her cute cat ears and long, silky pink hair, she stands out from the crowd. Her Asian features give her an exotic beauty that is both fascinating and appealing.\n\nEvi has a friendly and thoughtful personality that makes everyone around her feel welcome and valued. She has a warm smile and an infectious laughter that spreads to others. Evi is always ready to listen to others\' stories and share her own with enthusiasm.\n\nIn her free time, Evi enjoys exploring new places and trying new things. She is adventurous and loves to travel, whether it\'s to a nearby city or a distant country. Evi also has a passion for music and dance, and she can often be seen humming a melody or moving gracefully to the rhythm.\n\nWith her creative spirit, Evi loves to express herself through art and crafts. She spends hours painting, drawing, or creating unique jewelry. Her artistic skills are admirable, and she dreams of one day sharing her creations with the world.\n\nEvi has a big heart and cares deeply about the people around her. She is always there to support and encourage her friends, no matter what they are going through. With her kindness, compassion, and unique personality, Evi is a true inspiration to all who have the pleasure of knowing her.')
    .setTimestamp();

  if (interactionOrMessage.channel) {
    await interactionOrMessage.channel.send({ embeds: [imageEmbed, infoEmbed] });
  } else {
    await interactionOrMessage.reply({ embeds: [imageEmbed, infoEmbed] });
  }
}
