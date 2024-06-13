// src/commands/moderation/reactionrole.js
const { EmbedBuilder } = require('discord.js');
const { addReactionRole, removeReactionRole, addButtonRole, removeButtonRole, getReactionRoles, getMessageIdsWithReactionRoles } = require('../../database/reactionroledb');
const { hasPremiumSubscription } = require('../../database/database');

module.exports = {
  name: 'reactionrole',
  description: 'Manages reaction roles',
  usage: '<addemoji|removeemoji|addbutton|removebutton|list|info> <message-id> [emoji|button-name] [role]',
  aliases: ['rr'],
  permissions: ['MANAGE_ROLES'],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const messageId = args[1];

    if (!subcommand || (subcommand !== 'info' && subcommand !== 'list' && !messageId)) {
      return message.channel.send('Please provide a valid subcommand (addemoji/removeemoji/addbutton/removebutton/list/info) and message ID (if applicable).');
    }

    const isPremiumUser = await hasPremiumSubscription(message.author.id);
    const maxMessageIds = isPremiumUser ? 10 : 3;

    if (subcommand === 'addemoji') {
      const emoji = args[2];
      const roleInput = args[3];

      if (!emoji || !roleInput) {
        return message.channel.send('Please provide an emoji and a role.');
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

      const reactionRoles = await getReactionRoles(message.guild.id, messageId);
      const emojiCount = reactionRoles.filter(rr => rr.emoji).length;
      const userMessageIds = new Set(reactionRoles.map(rr => rr.message_id));

      if (userMessageIds.size >= maxMessageIds) {
        return message.channel.send(`You have reached the maximum number of messages (${maxMessageIds}) you can add reaction roles to. ${isPremiumUser ? '' : 'Upgrade to premium to add more.'}`);
      }

      if (!isPremiumUser && emojiCount >= 5) {
        return message.channel.send('You have reached the maximum number of emoji reaction roles for this message (5). Upgrade to premium to add more.');
      } else if (isPremiumUser && emojiCount >= 10) {
        return message.channel.send('You have reached the maximum number of emoji reaction roles for this message (10).');
      }

      try {
        await addReactionRole(message.guild.id, messageId, emoji, roleId, message.author.id, isPremiumUser);

        // Finn meldingen basert på meldingsID-en og legg til reaksjonen
        const channel = message.channel;
        const targetMessage = await channel.messages.fetch(messageId);
        await targetMessage.react(emoji);

        message.channel.send(`Reaction role added: ${emoji} -> <@&${roleId}>`);
      } catch (error) {
        console.error('Error adding reaction role:', error);
        message.channel.send('An error occurred while adding the reaction role.');
      }
    } else if (subcommand === 'removeemoji') {
      const emoji = args[2];

      if (!emoji) {
        return message.channel.send('Please provide an emoji.');
      }

      try {
        await removeReactionRole(message.guild.id, messageId, emoji);
        message.channel.send(`Reaction role removed: ${emoji}`);
      } catch (error) {
        console.error('Error removing reaction role:', error);
        message.channel.send('An error occurred while removing the reaction role.');
      }
    } else if (subcommand === 'addbutton') {
      const buttonName = args.slice(2).join(' ');
      const roleInput = args[args.length - 1];

      if (!buttonName || !roleInput) {
        return message.channel.send('Please provide a button name and a role.');
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

      const reactionRoles = await getReactionRoles(message.guild.id, messageId);
      const buttonCount = reactionRoles.filter(rr => rr.button_label).length;

      if (!isPremiumUser && buttonCount >= 2) {
        return message.channel.send('You have reached the maximum number of button reaction roles for this message (2). Upgrade to premium to add more.');
      } else if (isPremiumUser && buttonCount >= 5) {
        return message.channel.send('You have reached the maximum number of button reaction roles for this message (5).');
      }

      try {
        await addButtonRole(message.guild.id, messageId, buttonName, 'PRIMARY', roleId, message.author.id, isPremiumUser);
        message.channel.send(`Button role added: ${buttonName} -> <@&${roleId}>`);
      } catch (error) {
        console.error('Error adding button role:', error);
        message.channel.send('An error occurred while adding the button role.');
      }
    } else if (subcommand === 'removebutton') {
      const buttonName = args.slice(2).join(' ');

      if (!buttonName) {
        return message.channel.send('Please provide a button name.');
      }

      try {
        await removeButtonRole(message.guild.id, messageId, buttonName);
        message.channel.send(`Button role removed: ${buttonName}`);
      } catch (error) {
        console.error('Error removing button role:', error);
        message.channel.send('An error occurred while removing the button role.');
      }
    } else if (subcommand === 'list') {
      if (!messageId) {
        try {
          const messageIds = await getMessageIdsWithReactionRoles(message.guild.id);
          if (messageIds.length === 0) {
            message.channel.send('No messages with reaction roles found on this server.');
          } else {
            const embed = new EmbedBuilder()
              .setTitle('Messages with Reaction Roles')
              .setDescription('Here are the message IDs with reaction roles on this server:')
              .addFields(
                messageIds.map((id) => ({
                  name: `Message ID: ${id}`,
                  value: `[Jump to Message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${id})`,
                }))
              )
              .setTimestamp();

            message.channel.send({ embeds: [embed] });
          }
        } catch (error) {
          console.error('Error getting message IDs with reaction roles:', error);
          message.channel.send('An error occurred while getting the message IDs with reaction roles.');
        }
      } else {
        try {
          const reactionRoles = await getReactionRoles(message.guild.id, messageId);
          if (reactionRoles.length === 0) {
            message.channel.send('No reaction roles found for the specified message.');
          } else {
            const emojiRoles = reactionRoles.filter(rr => rr.emoji).map(rr => `${rr.emoji} -> <@&${rr.role_id}>`).join('\n');
            const buttonRoles = reactionRoles.filter(rr => rr.button_label).map(rr => `${rr.button_label} -> <@&${rr.role_id}>`).join('\n');

            let roleList = '';
            if (emojiRoles) {
              roleList += `Emoji Reaction Roles:\n${emojiRoles}\n\n`;
            }
            if (buttonRoles) {
              roleList += `Button Reaction Roles:\n${buttonRoles}`;
            }

            message.channel.send(`Reaction roles for message ${messageId}:\n${roleList}`);
          }
        } catch (error) {
          console.error('Error getting reaction roles:', error);
          message.channel.send('An error occurred while getting the reaction roles.');
        }
      }
    } else if (subcommand === 'info') {
        const embed = new EmbedBuilder()
          .setTitle('Reaction Role Information')
          .setDescription('Reaction roles allow users to self-assign roles by reacting to a message with a specific emoji or clicking a button. Here\'s how it works:')
          .addFields(
            {
              name: 'Emoji Reaction Roles',
              value: 'Moderators can use the `addemoji` subcommand to set up emoji reaction roles. When a user reacts to the specified message with the designated emoji, they will be assigned the corresponding role. Users can remove the role by removing their reaction. Free tier servers can have up to 5 emoji reaction roles per message, while premium servers can have up to 10.',
            },
            {
              name: 'Button Reaction Roles',
              value: 'Moderators can use the `addbutton` subcommand to set up button reaction roles. When a user clicks on the button, they will be assigned the corresponding role. Free tier servers can have up to 2 button reaction roles per message, while premium servers can have up to 5.',
            },
            {
              name: 'Removing Reaction Roles',
              value: 'Moderators can use the `removeemoji` and `removebutton` subcommands to remove emoji and button reaction roles, respectively.',
            },
            {
              name: 'Listing Reaction Roles',
              value: 'The `list` subcommand can be used to display all the reaction roles set up for a specific message. If no message ID is provided, it will show a list of all message IDs with reaction roles on the server.',
            },
            {
              name: 'Message Limits',
              value: 'Free tier servers can add reaction roles to up to 3 unique messages, while premium servers can add reaction roles to up to 10 unique messages.',
            }
          )
          .setColor('#0099ff')
          .setTimestamp();
      
        message.channel.send({ embeds: [embed] });
      } else {
      message.channel.send('Invalid subcommand. Please use "addemoji", "removeemoji", "addbutton", "removebutton", "list", or "info".');
    }
  },
  data: {
    name: 'reactionrole',
    description: 'Manages reaction roles',
    options: [
      {
        name: 'addemoji',
        type: 1, // SUB_COMMAND
        description: 'Adds an emoji reaction role',
        options: [
          {
            name: 'message-id',
            type: 3, // STRING
            description: 'The ID of the message to add the reaction role to',
            required: true,
          },
          {
            name: 'emoji',
            type: 3, // STRING
            description: 'The emoji to use for the reaction role',
            required: true,
          },
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to assign when the reaction is added',
            required: true,
          },
        ],
      },
      {
        name: 'removeemoji',
        type: 1, // SUB_COMMAND
        description: 'Removes an emoji reaction role',
        options: [
          {
            name: 'message-id',
            type: 3, // STRING
            description: 'The ID of the message to remove the reaction role from',
            required: true,
          },
          {
            name: 'emoji',
            type: 3, // STRING
            description: 'The emoji of the reaction role to remove',
            required: true,
          },
        ],
      },
      {
        name: 'addbutton',
        type: 1, // SUB_COMMAND
        description: 'Adds a button reaction role',
        options: [
          {
            name: 'message-id',
            type: 3, // STRING
            description: 'The ID of the message to add the button role to',
            required: true,
          },
          {
            name: 'button-name',
            type: 3, // STRING
            description: 'The name for the button',
            required: true,
          },
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to assign when the button is clicked',
            required: true,
          },
        ],
      },
      {
        name: 'removebutton',
        type: 1, // SUB_COMMAND
        description: 'Removes a button reaction role',
        options: [
          {
            name: 'message-id',
            type: 3, // STRING
            description: 'The ID of the message to remove the button role from',
            required: true,
          },
          {
            name: 'button-name',
            type: 3, // STRING
            description: 'The name of the button to remove',
            required: true,
          },
        ],
      },
      {
        name: 'list',
        type: 1, // SUB_COMMAND
        description: 'Lists all reaction roles for a message or all messages with reaction roles',
        options: [
          {
            name: 'message-id',
            type: 3, // STRING
            description: 'The ID of the message to list reaction roles for (optional)',
            required: false,
          },
        ],
      },
      {
        name: 'info',
        type: 1, // SUB_COMMAND
        description: 'Provides detailed information about reaction roles',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const messageId = interaction.options.getString('message-id');

    const isPremiumUser = await hasPremiumSubscription(interaction.user.id);
    const maxMessageIds = isPremiumUser ? 10 : 3;

    if (subcommand === 'addemoji') {
      const emoji = interaction.options.getString('emoji');
      const role = interaction.options.getRole('role');

      const reactionRoles = await getReactionRoles(interaction.guild.id, messageId);
      const emojiCount = reactionRoles.filter(rr => rr.emoji).length;
      const userMessageIds = new Set(reactionRoles.map(rr => rr.message_id));

      if (userMessageIds.size >= maxMessageIds) {
        return interaction.reply({ content: `You have reached the maximum number of messages (${maxMessageIds}) you can add reaction roles to. ${isPremiumUser ? '' : 'Upgrade to premium to add more.'}`, ephemeral: true });
      }

      if (!isPremiumUser && emojiCount >= 5) {
        return interaction.reply({ content: 'You have reached the maximum number of emoji reaction roles for this message (5). Upgrade to premium to add more.', ephemeral: true });
      } else if (isPremiumUser && emojiCount >= 10) {
        return interaction.reply({ content: 'You have reached the maximum number of emoji reaction roles for this message (10).', ephemeral: true });
      }

      try {
        await addReactionRole(interaction.guild.id, messageId, emoji, role.id, interaction.user.id, isPremiumUser);

        // Finn meldingen basert på meldingsID-en og legg til reaksjonen
        const channel = interaction.channel;
        const message = await channel.messages.fetch(messageId);
        await message.react(emoji);

        interaction.reply(`Reaction role added: ${emoji} -> ${role}`);
      } catch (error) {
        console.error('Error adding reaction role:', error);
        interaction.reply({ content: 'An error occurred while adding the reaction role.', ephemeral: true });
      }
    } else if (subcommand === 'removeemoji') {
      const emoji = interaction.options.getString('emoji');

      try {
        await removeReactionRole(interaction.guild.id, messageId, emoji);
        interaction.reply(`Reaction role removed: ${emoji}`);
      } catch (error) {
        console.error('Error removing reaction role:', error);
        interaction.reply({ content: 'An error occurred while removing the reaction role.', ephemeral: true });
      }
    } else if (subcommand === 'addbutton') {
      const buttonName = interaction.options.getString('button-name');
      const role = interaction.options.getRole('role');

      const reactionRoles = await getReactionRoles(interaction.guild.id, messageId);
      const buttonCount = reactionRoles.filter(rr => rr.button_label).length;

      if (!isPremiumUser && buttonCount >= 2) {
        return interaction.reply({ content: 'You have reached the maximum number of button reaction roles for this message (2). Upgrade to premium to add more.', ephemeral: true });
      } else if (isPremiumUser && buttonCount >= 5) {
        return interaction.reply({ content: 'You have reached the maximum number of button reaction roles for this message (5).', ephemeral: true });
      }

      try {
        await addButtonRole(interaction.guild.id, messageId, buttonName, 'PRIMARY', role.id, interaction.user.id, isPremiumUser);
        interaction.reply(`Button role added: ${buttonName} -> ${role}`);
      } catch (error) {
        console.error('Error adding button role:', error);
        interaction.reply({ content: 'An error occurred while adding the button role.', ephemeral: true });
      }
    } else if (subcommand === 'removebutton') {
      const buttonName = interaction.options.getString('button-name');

      try {
        await removeButtonRole(interaction.guild.id, messageId, buttonName);
        interaction.reply(`Button role removed: ${buttonName}`);
      } catch (error) {
        console.error('Error removing button role:', error);
        interaction.reply({ content: 'An error occurred while removing the button role.', ephemeral: true });
      }
    } else if (subcommand === 'list') {
      if (!messageId) {
        try {
          const messageIds = await getMessageIdsWithReactionRoles(interaction.guild.id);
          if (messageIds.length === 0) {
            interaction.reply('No messages with reaction roles found on this server.');
          } else {
            const embed = new EmbedBuilder()
              .setTitle('Messages with Reaction Roles')
              .setDescription('Here are the message IDs with reaction roles on this server:')
              .addFields(
                messageIds.map((id) => ({
                  name: `Message ID: ${id}`,
                  value: `[Jump to Message](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${id})`,
                }))
              )
              .setTimestamp();

            interaction.reply({ embeds: [embed] });
          }
        } catch (error) {
          console.error('Error getting message IDs with reaction roles:', error);
          interaction.reply('An error occurred while getting the message IDs with reaction roles.');
        }
      } else {
        try {
          const reactionRoles = await getReactionRoles(interaction.guild.id, messageId);
          if (reactionRoles.length === 0) {
            interaction.reply('No reaction roles found for the specified message.');
          } else {
            const emojiRoles = reactionRoles.filter(rr => rr.emoji).map(rr => `${rr.emoji} -> <@&${rr.role_id}>`).join('\n');
            const buttonRoles = reactionRoles.filter(rr => rr.button_label).map(rr => `${rr.button_label} -> <@&${rr.role_id}>`).join('\n');

            let roleList = '';
            if (emojiRoles) {
              roleList += `Emoji Reaction Roles:\n${emojiRoles}\n\n`;
            }
            if (buttonRoles) {
              roleList += `Button Reaction Roles:\n${buttonRoles}`;
            }

            interaction.reply(`Reaction roles for message ${messageId}:\n${roleList}`);
          }
        } catch (error) {
          console.error('Error getting reaction roles:', error);
          interaction.reply({ content: 'An error occurred while getting the reaction roles.', ephemeral: true });
        }
      }
    } else if (subcommand === 'info') {
        const embed = new EmbedBuilder()
          .setTitle('Reaction Role Information')
          .setDescription('Reaction roles allow users to self-assign roles by reacting to a message with a specific emoji or clicking a button. Here\'s how it works:')
          .addFields(
            {
              name: 'Emoji Reaction Roles',
              value: 'Moderators can use the `addemoji` subcommand to set up emoji reaction roles. When a user reacts to the specified message with the designated emoji, they will be assigned the corresponding role. Users can remove the role by removing their reaction. Free tier servers can have up to 5 emoji reaction roles per message, while premium servers can have up to 10.',
            },
            {
              name: 'Button Reaction Roles',
              value: 'Moderators can use the `addbutton` subcommand to set up button reaction roles. When a user clicks on the button, they will be assigned the corresponding role. Free tier servers can have up to 2 button reaction roles per message, while premium servers can have up to 5.',
            },
            {
              name: 'Removing Reaction Roles',
              value: 'Moderators can use the `removeemoji` and `removebutton` subcommands to remove emoji and button reaction roles, respectively.',
            },
            {
              name: 'Listing Reaction Roles',
              value: 'The `list` subcommand can be used to display all the reaction roles set up for a specific message. If no message ID is provided, it will show a list of all message IDs with reaction roles on the server.',
            },
            {
              name: 'Message Limits',
              value: 'Free tier servers can add reaction roles to up to 3 unique messages, while premium servers can add reaction roles to up to 10 unique messages.',
            }
          )
          .setColor('#0099ff')
          .setTimestamp();
      
        message.reply({ embeds: [embed] });
      }      
  },
};
