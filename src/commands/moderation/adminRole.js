// src/commands/moderation/adminRole.js
const { setAdminRole, getAdminRole, removeAdminRole } = require('../../database/database');

module.exports = {
  name: 'adminrole',
  description: 'Manages the admin role for the server',
  usage: '<add|remove> [role]',
  aliases: ['ar'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['owner'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

    if (subcommand === 'add') {
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

      getAdminRole(message.guild.id, (currentAdminRole) => {
        if (currentAdminRole) {
          message.reply(`The admin role is already set to <@&${currentAdminRole}>. Please remove it before setting a new one.`);
        } else {
          setAdminRole(message.guild.id, roleId, () => {
            message.reply(`Set the admin role to <@&${roleId}>.`);
          });
        }
      });
    } else if (subcommand === 'remove') {
      getAdminRole(message.guild.id, (currentAdminRole) => {
        if (currentAdminRole) {
          removeAdminRole(message.guild.id, () => {
            message.reply(`Removed the admin role <@&${currentAdminRole}>.`);
          });
        } else {
          message.reply('There is no admin role set.');
        }
      });
    } else {
      message.reply('Invalid subcommand. Please use `add` or `remove`.');
    }
  },
  data: {
    name: 'adminrole',
    description: 'Manages the admin role for the server',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds the admin role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to set as the admin role',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the admin role for the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const roleId = interaction.options.getRole('role').id;

      getAdminRole(interaction.guild.id, (currentAdminRole) => {
        if (currentAdminRole) {
          interaction.reply(`The admin role is already set to <@&${currentAdminRole}>. Please remove it before setting a new one.`);
        } else {
          setAdminRole(interaction.guild.id, roleId, () => {
            interaction.reply(`Set the admin role to <@&${roleId}>.`);
          });
        }
      });
    } else if (subcommand === 'remove') {
      getAdminRole(interaction.guild.id, (currentAdminRole) => {
        if (currentAdminRole) {
          removeAdminRole(interaction.guild.id, () => {
            interaction.reply(`Removed the admin role <@&${currentAdminRole}>.`);
          });
        } else {
          interaction.reply('There is no admin role set.');
        }
      });
    }
  },
};
