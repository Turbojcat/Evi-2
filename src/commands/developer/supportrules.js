// src/commands/developer/supportrules.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { developerIDs, discordRulesRoleId, eviRulesRoleId } = require('../../config');

module.exports = {
  name: 'supportrules',
  description: 'Displays the rules for Evi\'s support server',
  usage: '',
  aliases: [],
  permissions: [],
  execute: async (message) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.channel.send('This command is only available for developers.');
    }

    const embed = new EmbedBuilder()
      .setTitle('📜 Rules for Evi\'s Discord Support Server 📜')
      .setDescription(`
**1**. 🤝 Be respectful and kind to all members. Harassment, bullying, or discrimination of any kind will not be tolerated.
**2**. 👪 Keep discussions and content appropriate for all ages. Do not share explicit, violent, or offensive material.
**3**. 📚 Use appropriate channels for discussions and stay on topic within each channel. Avoid spamming or posting irrelevant content.
**4**. 🔒 Do not share personal information about yourself or others, including real names, addresses, phone numbers, or other contact details.
**5**. 🚫 Do not advertise or share links to other servers, websites, or products without permission from a moderator.
**6**. 📜 Follow Discord's Terms of Service and Community Guidelines. Violating Discord's terms may result in removal from the server.
**7**. ©️ Respect copyright and do not share pirated content, including software, music, movies, or other protected works.
**8**. 🤖 Do not abuse or spam bot commands. Follow the instructions for each command and avoid excessive use.
**9**. 🙋 If you have a problem or concern, please contact a moderator or administrator privately for assistance. Don't hesitate to report rule violations.
**10**. 🎉 Have fun, be engaged, and contribute to a positive and supportive community for all Evi users!

Remember, moderators and administrators have the final say in enforcing the rules and maintaining a safe and enjoyable environment on the server. Violations of the rules may result in warnings, mutes, or permanent bans, depending on the severity and number of offenses.

Let's work together to create an amazing community! 😄
`)
      .setColor('#FFD700');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('discordRules')
          .setLabel('Discord Rules Accepted')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('eviRules')
          .setLabel('Evi\'s Bot Rules Accepted')
          .setStyle(ButtonStyle.Success)
      );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = sentMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'discordRules') {
        const role = interaction.guild.roles.cache.get(discordRulesRoleId);
        if (role) {
          await interaction.member.roles.add(role);
          const reply = await interaction.reply({ content: 'You have accepted the Discord rules!', ephemeral: true });
          setTimeout(() => {
            interaction.deleteReply();
          }, 30000);
        }
      } else if (interaction.customId === 'eviRules') {
        const role = interaction.guild.roles.cache.get(eviRulesRoleId);
        if (role) {
          await interaction.member.roles.add(role);
          const reply = await interaction.reply({ content: 'You have accepted Evi\'s bot rules!', ephemeral: true });
          setTimeout(() => {
            interaction.deleteReply();
          }, 30000);
        }
      }
    });

    collector.on('end', async () => {
      await sentMessage.edit({ components: [] });
    });
  },
};
