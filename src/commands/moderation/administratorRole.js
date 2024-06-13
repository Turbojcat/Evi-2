// src/commands/moderation/administratorRole.js
const { setAdminRole, getAdminRoles, removeAdminRole } = require('../../database/adminModRoles');

module.exports = {
  name: 'administratorrole',
  description: 'Manages the administrator roles for the server',
  usage: '<add|remove|list> [role]',
  aliases: ['adminrole', 'adr'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

    if (subcommand === 'add') {
      if (!roleInput) {
        return message.channel.send('Please provide a role to add as an administrator role.');
      }

      let roleId;
      if (roleInput.startsWith('<@&') && roleInput.endsWith('>')) {
        roleId = roleInput.slice(3, -1);
      } else if (message.guild.roles.cache.has(roleInput)) {
        roleId = roleInput;
      } else {
        const role = message.guild.roles.cache.find(r => r.name === roleInput);
        if (role) {
          roleId = role.id;
        }
      }

      if (!roleId) {
        return message.channel.send('Invalid role. Please provide a valid role mention, ID, or name.');
      }

      await setAdminRole(message.guild.id, roleId);
      message.channel.send(`Added <@&${roleId}> as an administrator role.`);
    } else if (subcommand === 'remove') {
      if (!roleInput) {
        return message.channel.send('Please provide a role to remove from administrator roles.');
      }

      let roleId;
      if (roleInput.startsWith('<@&') && roleInput.endsWith('>')) {
        roleId = roleInput.slice(3, -1);
      } else if (message.guild.roles.cache.has(roleInput)) {
        roleId = roleInput;
      } else {
        const role = message.guild.roles.cache.find(r => r.name === roleInput);
        if (role) {
          roleId = role.id;
        }
      }

      if (!roleId) {
        return message.channel.send('Invalid role. Please provide a valid role mention, ID, or name.');
      }

      await removeAdminRole(message.guild.id, roleId);
      message.channel.send(`Removed <@&${roleId}> from administrator roles.`);
    } else if (subcommand === 'list') {
      const adminRoles = await getAdminRoles(message.guild.id);

      if (adminRoles.length === 0) {
        message.channel.send('There are no administrator roles set.');
      } else {
        const roleList = adminRoles.map(roleId => `<@&${roleId}>`).join(', ');
        message.channel.send(`Current administrator roles: ${roleList}`);
      }
    } else {
      message.channel.send('Invalid subcommand. Please use "add", "remove", or "list".');
    }
  },
  data: {
    name: 'administratorrole',
    description: 'Manages the administrator roles for the server',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds an administrator role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to add as an administrator role',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes an administrator role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to remove from administrator roles',
            required: true,
          },
        ],
      },
      {
        name: 'list',
        type: 1, // SUB_COMMAND
        description: 'Lists all administrator roles for the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const roleInput = interaction.options.getRole('role');

    if (subcommand === 'add') {
      await setAdminRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Added ${roleInput} as an administrator role.`);
    } else if (subcommand === 'remove') {
      await removeAdminRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Removed ${roleInput} from administrator roles.`);
    } else if (subcommand === 'list') {
      const adminRoles = await getAdminRoles(interaction.guild.id);

      if (adminRoles.length === 0) {
        interaction.reply('There are no administrator roles set.');
      } else {
        const roleList = adminRoles.map(roleId => `<@&${roleId}>`).join(', ');
        interaction.reply(`Current administrator roles: ${roleList}`);
      }
    }
  },
};
