const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'invite',
  description: 'Invite Evi to your server',
  aliases: ['inv'],
  execute: async (message, args, bot) => {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription('**In order to grow, will you help me by inviting me to your server?\nYou can find info about me by using the `evi info` command.**')
      .addFields(
        {
          name: 'Invite me!',
          value: '[Click me to invite Evi to your server!](https://discord.com/api/oauth2/authorize?client_id=804424228022648832&permissions=8&scope=bot)',
          inline: false
        },
        {
          name: '🆘 Support Server',
          value: '[Click here to join Evi\'s support server](https://discord.gg/6tnqjeRach)',
          inline: false
        },
        {
          name: '🔗 Helpful Links',
          value: [
            '• [Vote for Evi on top.gg](https://top.gg/bot/804424228022648832/vote)',
            '• [Visit Evi\'s website](https://your-website-url.com)',
            '• [Support Evi on Patreon](https://www.patreon.com/your-patreon-url)'
          ].join('\n'),
          inline: false
        }
      );

    await message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'invite',
    description: 'Invite Evi to your server',
  },
  executeSlash: async (interaction, bot) => {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription('**In order to grow, will you help me by inviting me to your server?\nYou can find info about me by using the `evi info` command.**')
      .addFields(
        {
          name: 'Invite me!',
          value: '[Click me to invite Evi to your server!](https://discord.com/api/oauth2/authorize?client_id=804424228022648832&permissions=8&scope=bot)',
          inline: false
        },
        {
          name: '🆘 Support Server',
          value: '[Click here to join Evi\'s support server](https://discord.gg/6tnqjeRach)',
          inline: false
        },
        {
          name: '🔗 Helpful Links',
          value: [
            '• [Vote for Evi on top.gg](https://top.gg/bot/804424228022648832/vote)',
            '• [Visit Evi\'s website](https://your-website-url.com)',
            '• [Support Evi on Patreon](https://www.patreon.com/your-patreon-url)'
          ].join('\n'),
          inline: false
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
