// src/commands/economy/balance.js

const { addBalance, removeBalance, getBalance, getRolePermissionLevel } = require('../../database/database');

module.exports = {
  name: 'balance',
  description: 'Manages a user\'s balance',
  usage: '[add|remove] [user] [amount]',
  aliases: ['bal'],
  permissions: [],
  permissionLevel: ['normal'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const user = message.mentions.users.first() || message.author;
    const amount = parseFloat(args[2]);

    if (subcommand === 'add' || subcommand === 'remove') {
      const isServerOwner = message.guild.ownerId === message.author.id;
      const userPermissionLevel = isServerOwner ? 'owner' : await getRolePermissionLevel(message.guild.id, message.member.roles.highest.id);

      if (!['moderator', 'admin', 'owner'].includes(userPermissionLevel)) {
        return message.reply('You do not have permission to use this subcommand.');
      }

      if (!user || isNaN(amount)) {
        return message.reply('Please provide a valid user and amount.');
      }

      if (subcommand === 'add') {
        await addBalance(message.guild.id, user.id, amount);
        message.reply(`${amount} Evi :coin: added to ${user}`);
      } else if (subcommand === 'remove') {
        await removeBalance(message.guild.id, user.id, amount);
        message.reply(`${amount} Evi :coin: removed from ${user}`);
      }
    } else {
      const balance = await getBalance(message.guild.id, user.id);
      message.reply(`${user} you have ${balance} Evi :coin:`);
    }
  },
  data: {
    name: 'balance',
    description: 'Manages a user\'s balance',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to check the balance of (optional)',
        required: false,
      },
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds balance to a user',
        options: [
          {
            name: 'user',
            type: 6, // USER
            description: 'The user to add balance to',
            required: true,
          },
          {
            name: 'amount',
            type: 10, // NUMBER
            description: 'The amount to add',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes balance from a user',
        options: [
          {
            name: 'user',
            type: 6, // USER
            description: 'The user to remove balance from',
            required: true,
          },
          {
            name: 'amount',
            type: 10, // NUMBER
            description: 'The amount to remove',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user') || interaction.user;

    if (subcommand === 'add' || subcommand === 'remove') {
      const isServerOwner = interaction.guild.ownerId === interaction.user.id;
      const userPermissionLevel = isServerOwner ? 'owner' : await getRolePermissionLevel(interaction.guild.id, interaction.member.roles.highest.id);

      if (!['moderator', 'admin', 'owner'].includes(userPermissionLevel)) {
        return interaction.reply({ content: 'You do not have permission to use this subcommand.', ephemeral: true });
      }

      const amount = interaction.options.getNumber('amount');

      if (subcommand === 'add') {
        await addBalance(interaction.guild.id, user.id, amount);
        interaction.reply(`${amount} Evi :coin: added to ${user}`);
      } else if (subcommand === 'remove') {
        await removeBalance(interaction.guild.id, user.id, amount);
        interaction.reply(`${amount} Evi :coin: removed from ${user}`);
      }
    } else {
      const balance = await getBalance(interaction.guild.id, user.id);
      interaction.reply(`${user} you have ${balance} Evi :coin:`);
    }
  },
};
