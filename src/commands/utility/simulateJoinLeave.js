// src/commands/utility/simulateJoinLeave.js
module.exports = {
  name: 'simulate',
  description: 'Simulates a user joining or leaving the server',
  usage: '<join|leave> <user>',
  aliases: ['sim'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const userInput = args.slice(1).join(' ');

    if (!subcommand || !userInput) {
      return message.channel.send('Please provide a valid subcommand (join/leave) and user.');
    }

    let user;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      const userId = userInput.slice(2, -1);
      user = await message.client.users.fetch(userId);
    } else {
      const member = message.guild.members.cache.find(
        (member) =>
          member.user.username.toLowerCase() === userInput.toLowerCase() ||
          member.user.tag.toLowerCase() === userInput.toLowerCase() ||
          member.id === userInput
      );
      if (member) {
        user = member.user;
      }
    }

    if (!user) {
      return message.channel.send('Invalid user. Please provide a valid user mention, username, tag, or ID.');
    }

    if (subcommand === 'join') {
      message.client.emit('guildMemberAdd', message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id));
      message.channel.send(`Simulated ${user.tag} joining the server.`);
    } else if (subcommand === 'leave') {
      message.client.emit('guildMemberRemove', message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id));
      message.channel.send(`Simulated ${user.tag} leaving the server.`);
    }
  },
  data: {
    name: 'simulate',
    description: 'Simulates a user joining or leaving the server',
    options: [
      {
        name: 'join',
        type: 1, // SUB_COMMAND
        description: 'Simulates a user joining the server',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user to simulate joining the server',
            required: true,
          },
        ],
      },
      {
        name: 'leave',
        type: 1, // SUB_COMMAND
        description: 'Simulates a user leaving the server',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user to simulate leaving the server',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const userInput = interaction.options.getString('user');

    let user;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      const userId = userInput.slice(2, -1);
      user = await interaction.client.users.fetch(userId);
    } else {
      const member = interaction.guild.members.cache.find(
        (member) =>
          member.user.username.toLowerCase() === userInput.toLowerCase() ||
          member.user.tag.toLowerCase() === userInput.toLowerCase() ||
          member.id === userInput
      );
      if (member) {
        user = member.user;
      }
    }

    if (!user) {
      return interaction.reply({ content: 'Invalid user. Please provide a valid user mention, username, tag, or ID.', ephemeral: true });
    }

    if (subcommand === 'join') {
      interaction.client.emit('guildMemberAdd', interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id));
      interaction.reply(`Simulated ${user.tag} joining the server.`);
    } else if (subcommand === 'leave') {
      interaction.client.emit('guildMemberRemove', interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id));
      interaction.reply(`Simulated ${user.tag} leaving the server.`);
    }
  },
};
