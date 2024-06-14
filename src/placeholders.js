// src/placeholders.js
const { getBalance } = require('./database/ecodb');

module.exports = {
  placeholders: {
    user: 'Mentions the user',
    username: 'Displays the username of the user',
    discriminator: 'Displays the discriminator of the user',
    server: 'Displays the server name',
    memberCount: 'Displays the member count of the server',
    channelName: 'Displays the name of the current channel',
    channelMention: 'Mentions the current channel',
    channelTopic: 'Displays the topic of the current channel',
    roleCount: 'Displays the number of roles in the server',
    roleMention: 'Mentions a specific role (e.g., {roleMention:role_id})',
    roleName: 'Displays the name of a specific role (e.g., {roleName:role_id})',
    emoji: 'Displays a specific emoji (e.g., {emoji:emoji_id})',
    balance: 'Displays the user\'s balance',
    // Add more placeholders as needed
  },
  replacePlaceholders: async (interaction, text) => {
    const placeholderRegex = /{([^}]+)}/g;
    return text.replace(placeholderRegex, async (match, placeholder) => {
      const [key, value] = placeholder.split(':');
      switch (key) {
        case 'user':
          return `<@${interaction.user.id}>`;
        case 'username':
          return interaction.user.username;
        case 'discriminator':
          return interaction.user.discriminator;
        case 'server':
          return interaction.guild.name;
        case 'memberCount':
          return interaction.guild.memberCount.toString();
        case 'channelName':
          return interaction.channel.name;
        case 'channelMention':
          return `<#${interaction.channel.id}>`;
        case 'channelTopic':
          return interaction.channel.topic || '';
        case 'roleCount':
          return interaction.guild.roles.cache.size.toString();
        case 'roleMention':
          return `<@&${value}>`;
        case 'roleName':
          return interaction.guild.roles.cache.get(value)?.name || '';
        case 'emoji':
          return interaction.guild.emojis.cache.get(value)?.toString() || '';
        case 'balance':
          const balance = await getBalance(interaction.guild.id, interaction.user.id);
          return balance.toString();
        // Add more cases for additional placeholders
        default:
          return match;
      }
    });
  },
  getPlaceholdersEmbed: () => {
    const placeholderList = Object.entries(module.exports.placeholders)
      .map(([placeholder, description]) => `{${placeholder}} - ${description}`)
      .join('\n');

    const placeholderInfo = `
      Placeholders are special variables that can be used in custom embeds to dynamically insert information.
      When a placeholder is used in an embed, it will be replaced with the corresponding value when the embed is sent.

      To use a placeholder, simply include it in your embed text enclosed in curly braces {}.
      For example, to display the user's username, you can use the placeholder {username}.

      Some placeholders require additional information, such as an ID, which can be provided after a colon :.
      For example, to mention a specific role, you can use the placeholder {roleMention:role_id},
      replacing "role_id" with the actual ID of the role you want to mention.

      Here are the available placeholders you can use in your custom embeds:
    `;

    return {
      title: 'Available Placeholders',
      description: placeholderInfo,
      fields: [
        {
          name: 'Placeholders',
          value: placeholderList,
        },
      ],
    };
  },
};
