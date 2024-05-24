// src/commands/moderation/moderationRole.js
const { addRolePermission, removeRolePermission } = require('../../database/database');

module.exports = {
  name: 'moderationrole',
  description: 'Manages the list of moderator roles',
  usage: '<add|remove> <role>',
  aliases: ['modrole', 'mr'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: 'admin',
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

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
      return message.reply('Invalid role. Please provide a valid role mention, ID, or name.');
    }

    if (subcommand === 'add') {
      await addRolePermission(message.guild.id, roleId, 'moderator');
      message.reply(`Added role <@&${roleId}> to the list of moderator roles.`);
    } else if (subcommand === 'remove') {
      await removeRolePermission(message.guild.id, roleId);
      message.reply(`Removed role <@&${roleId}> from the list of moderator roles.`);
    } else {
      message.reply('Invalid subcommand. Please use `add` or `remove`.');
    }
  },
  data: {
    name: 'moderationrole',
    description: 'Manages the list of moderator roles',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds a role to the list of moderator roles',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to add as a moderator role',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes a role from the list of moderator roles',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to remove from the moderator roles',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const roleId = interaction.options.getRole('role').id;

    if (subcommand === 'add') {
      await addRolePermission(interaction.guild.id, roleId, 'moderator');
      interaction.reply(`Added role <@&${roleId}> to the list of moderator roles.`);
    } else if (subcommand === 'remove') {
      await removeRolePermission(interaction.guild.id, roleId);
      interaction.reply(`Removed role <@&${roleId}> from the list of moderator roles.`);
    }
  },
};
