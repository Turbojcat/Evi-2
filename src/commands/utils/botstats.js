const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'botstats',
  description: 'Displays Evi\'s status and info',
  aliases: ['bs', 'stats', 'bi', 'botinfo'],
  execute: async (message, args, bot, commandHandler) => {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: 'Evi\'s Information' })
      .setFooter({ text: `Bot info requested by ${message.author.tag} | ${message.author.username} | ${message.author.id}` })
      .setDescription('**Evi\'s status and info!**')
      .addFields(
        { name: '🤖 Bot name', value: `My name is **${bot.user.username}**!`, inline: false },
        { name: '🧚🏻 Users', value: `Watching over **${bot.users.cache.size} users**!`, inline: false },
        { name: '🌐 Server', value: `I'm on **${bot.guilds.cache.size} server's**!`, inline: false },
        { name: '🇨 Commands', value: `Evi has **${commandHandler.commands.size} commands**!`, inline: false },
        { name: '🇦 Aliases', value: `Evi has **${Object.values(commandHandler.commands).reduce((total, cmd) => total + (cmd.aliases?.length || 0), 0)} aliases**!`, inline: false },
        {
          name: '📥 Invite me!',
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
    name: 'botstats',
    description: 'Displays Evi\'s status and info',
  },
  executeSlash: async (interaction, bot, commandHandler) => {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: 'Evi\'s Information' })
      .setFooter({ text: `Bot info requested by ${interaction.user.tag} | ${interaction.user.username} | ${interaction.user.id}` })
      .setDescription('**Evi\'s status and info!**')
      .addFields(
        { name: '🤖 Bot name', value: `My name is **${bot.user.username}**!`, inline: false },
        { name: '🧚🏻 Users', value: `Watching over **${bot.users.cache.size} users**!`, inline: false },
        { name: '🌐 Server', value: `I'm on **${bot.guilds.cache.size} server's**!`, inline: false },
        { name: '🇨 Commands', value: `Evi has **${commandHandler.commands.size} commands**!`, inline: false },
        { name: '🇦 Aliases', value: `Evi has **${Object.values(commandHandler.commands).reduce((total, cmd) => total + (cmd.aliases?.length || 0), 0)} aliases**!`, inline: false },
        {
          name: '📥 Invite me!',
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
