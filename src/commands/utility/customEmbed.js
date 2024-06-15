// src/commands/utility/customEmbed.js
const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder } = require('discord.js');
const { createEmbed, getEmbed, updateEmbed, deleteEmbed, getEmbeds, getEmbedCount } = require('../../database/embeddb');
const { placeholders, getPlaceholdersEmbed, replacePlaceholders } = require('../../placeholders');
const { hasPremiumSubscription } = require('../../database/database');

async function executeList(message) {
  try {
    const embeds = await getEmbeds(message.author.id, message.guild.id);

    if (embeds.length === 0) {
      return message.channel.send('You have no custom embeds.');
    }

    const embedList = embeds.map((embed, index) => `${index + 1}. Embed ID: ${embed.id}`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Custom Embeds')
      .setDescription(`Here is a list of your custom embeds:\n\n${embedList}`)
      .setColor('#0099ff')
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error retrieving custom embeds:', error);
    message.channel.send('An error occurred while retrieving your custom embeds.');
  }
}

async function executeInfo(message) {
  const pages = [
    new EmbedBuilder()
      .setTitle('Custom Embed Information')
      .setDescription('Welcome to the custom embed system! This feature allows you to create, view, edit, and delete custom embeds for your server. Here\'s how it works:')
      .addFields(
        {
          name: 'Creating a Custom Embed',
          value: 'To create a new custom embed, use the `customembed create` command. You will be presented with a series of buttons that allow you to customize various parts of the embed, such as the title, author, description, fields, footer, timestamp, color, image URL, and thumbnail URL.\n\nClick on the desired button and fill in the information in the modal that appears. You can add multiple fields to your embed by clicking the "Field" button multiple times. Each field consists of a name, value, and an inline option (true/false) to determine if the field should be displayed inline with other fields.\n\nTo set the color of your embed, click the "Color" button and enter a valid color value (hex code or color name) in the modal.\n\nYou can also use placeholders in your embed by clicking the "Placeholders" button. This will display a list of available placeholders that you can use to dynamically insert information into your embed.\n\nOnce you\'re satisfied with your custom embed, click the "Save" button to create it. The bot will generate a unique ID for your embed, which you can use to view, edit, or delete it later.'
        }
      )
      .setColor('#0099ff')
      .setTimestamp()
      .setFooter({ text: '1. Introduction and creating a custom embed' }),
    new EmbedBuilder()
      .setTitle('Custom Embed Information')
      .setDescription('Viewing and Editing Custom Embeds')
      .addFields(
        {
          name: 'Viewing a Custom Embed',
          value: 'To view a specific custom embed, use the `customembed view <embedID>` command, replacing `<embedID>` with the ID of the embed you want to view. The bot will display the embed along with three buttons: "Send", "Edit", and "Delete".\n\nClicking the "Send" button will send the custom embed to the current channel, allowing you to see how it looks. Clicking the "Edit" button will allow you to modify the embed using the same customization process as when creating a new embed. Clicking the "Delete" button will permanently delete the custom embed.'
        },
        {
          name: 'Editing a Custom Embed',
          value: 'To edit an existing custom embed, use the `customembed edit <embedID>` command, replacing `<embedID>` with the ID of the embed you want to edit. You will be presented with the same customization buttons as when creating a new embed.\n\nYou can modify any part of the embed by clicking the corresponding button and updating the information in the modal. If you only want to change a specific part, such as the description or color, simply click the respective button and update it while leaving the other parts unchanged.\n\nWhen you\'re done editing, click the "Save" button to save your changes. The bot will update the custom embed with the new information.'
        }
      )
      .setColor('#0099ff')
      .setTimestamp()
      .setFooter({ text: '2. Viewing and editing custom embeds' }),
    new EmbedBuilder()
      .setTitle('Custom Embed Information')
      .setDescription('Deleting Custom Embeds and Command Usage')
      .addFields(
        {
          name: 'Deleting a Custom Embed',
          value: 'To delete a custom embed, use the `customembed delete <embedID>` command, replacing `<embedID>` with the ID of the embed you want to delete. The bot will permanently remove the embed from the database, and it will no longer be accessible.\n\nPlease note that deleting a custom embed is irreversible, so make sure you really want to delete it before using this command.'
        },
        {
          name: 'Command Usage',
          value: 'Here\'s a summary of the available commands for managing custom embeds:\n\n- `customembed create`: Creates a new custom embed.\n- `customembed view <embedID>`: Views a specific custom embed.\n- `customembed edit <embedID>`: Edits an existing custom embed.\n- `customembed delete <embedID>`: Deletes a custom embed.\n- `customembed list`: Lists all your custom embeds.\n- `customembed info`: Displays this information about the custom embed system.'
        }
      )
      .setColor('#0099ff')
      .setTimestamp()
      .setFooter({ text: '3. Deleting custom embeds and command usage' }),
    new EmbedBuilder()
      .setTitle('Custom Embed Information')
      .setDescription('Additional Tips and Considerations')
      .addFields(
        {
          name: 'Embed Limits',
          value: 'Please keep in mind that there are certain limits imposed by Discord on the size and content of embeds. The bot will try to validate your input and provide appropriate feedback if any limits are exceeded.\n\nFor example, the title of an embed cannot exceed 256 characters, and the description and field values have a maximum length of 4096 characters. The bot will truncate any input that exceeds these limits to ensure the embed remains within the allowed boundaries.'
        },
        {
          name: 'Embed Management',
          value: 'As the creator of a custom embed, you have full control over its management. Only you can view, edit, or delete your own custom embeds. Server administrators and moderators do not have access to modify or delete embeds created by other users.\n\nIf you need assistance with managing your custom embeds or have any questions about the system, feel free to reach out to the server staff or the bot developer for further guidance.'
        },
        {
          name: 'Embed Limits per User and Server',
          value: 'There are limits on the number of custom embeds you can create based on your subscription status and server limits.\n\nFree users can create up to 3 custom embeds, while premium users can create up to 10 custom embeds.\n\nAdditionally, each server has a maximum limit of 10 custom embeds in total, regardless of the user\'s subscription status.\n\nIf you reach your personal limit or the server limit, you will need to delete some existing embeds before creating new ones.'
        }
      )
      .setColor('#0099ff')
      .setTimestamp()
      .setFooter({ text: '4. Additional tips and considerations' })
  ];

  let currentPage = 0;
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === pages.length - 1)
    );

  const sentMessage = await message.channel.send({ embeds: [pages[currentPage]], components: [row] });

  const filter = (interaction) => interaction.user.id === message.author.id;
  const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async (interaction) => {
    if (interaction.customId === 'previous') {
      if (currentPage > 0) {
        currentPage--;
        row.components[0].setDisabled(currentPage === 0);
        row.components[1].setDisabled(false);
        await interaction.update({ embeds: [pages[currentPage]], components: [row] });
      }
    } else if (interaction.customId === 'next') {
      if (currentPage < pages.length - 1) {
        currentPage++;
        row.components[0].setDisabled(false);
        row.components[1].setDisabled(currentPage === pages.length - 1);
        await interaction.update({ embeds: [pages[currentPage]], components: [row] });
      }
    }
  });

  collector.on('end', async () => {
    row.components.forEach((component) => component.setDisabled(true));
    await sentMessage.edit({ components: [row] });
  });
}

module.exports = {
  name: 'customembed',
  description: 'Manages custom embeds',
  usage: '<create|view|edit|delete|list|info> [embedID]',
  aliases: ['ce', 'embed'],
  permissions: [],
  permissionLevel: ['moderator'],
  execute: async (message, args) => {
    const subcommand = args[0];

    if (subcommand === 'create') {
      await module.exports.executeCreate(message);
    } else if (subcommand === 'view') {
      const embedId = args[1];
      if (!embedId) {
        return message.channel.send('Please provide the embed ID to view the custom embed.');
      }
      await module.exports.executeView(message, [embedId]);
    } else if (subcommand === 'edit') {
      const embedId = args[1];
      if (!embedId) {
        return message.channel.send('Please provide the embed ID to edit the custom embed.');
      }
      await module.exports.executeEdit(message, [embedId]);
    } else if (subcommand === 'delete') {
      const embedId = args[1];
      if (!embedId) {
        return message.channel.send('Please provide the embed ID to delete the custom embed.');
      }
      await module.exports.executeDelete(message, [embedId]);
    } else if (subcommand === 'list') {
      await executeList(message);
    } else if (subcommand === 'info') {
      await executeInfo(message);
    } else {
      const embed = new EmbedBuilder()
        .setTitle('Custom Embed Commands')
        .setDescription('Here are the available subcommands for managing custom embeds:')
        .addFields(
          { name: 'Create', value: '`customembed create`' },
          { name: 'View', value: '`customembed view <embedId>`' },
          { name: 'Edit', value: '`customembed edit <embedId>`' },
          { name: 'Delete', value: '`customembed delete <embedId>`' },
          { name: 'List', value: '`customembed list`' },
          { name: 'Info', value: '`customembed info`' }
        )
        .setColor('#0099ff')
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  },
  executeCreate: async (message) => {
    const filter = (interaction) => interaction.user.id === message.author.id;

    const customEmbed = new EmbedBuilder()
      .setDescription('This is a custom embed. Click the buttons below to customize it.');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('title')
          .setLabel('Title')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('author')
          .setLabel('Author')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('description')
          .setLabel('Description')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('field')
          .setLabel('Field')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('footer')
          .setLabel('Footer')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('color')
          .setLabel('Color')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('image')
          .setLabel('Image')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('thumbnail')
          .setLabel('Thumbnail')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('placeholders')
          .setLabel('Placeholders')
          .setStyle(ButtonStyle.Primary)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('save')
          .setLabel('Save')
          .setStyle(ButtonStyle.Success)
      );

    try {
      const sentMessage = await message.channel.send({ content: 'Customize your embed:', embeds: [customEmbed], components: [row, row2, row3] });

      const collector = sentMessage.createMessageComponentCollector({ filter, time: 300000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'save') {
          const embedCount = await getEmbedCount(message.author.id, message.guild.id);
          const embedLimit = await getCustomCommandLimit(message.guild.id);

          if (embedCount >= embedLimit) {
            return interaction.reply({ content: `You have reached the maximum number of custom embeds (${embedLimit}). Please delete some before creating new ones.`, ephemeral: true });
          }

          if (!customEmbed.data.description) {
            customEmbed.setDescription('This is a custom embed.');
          }

          customEmbed.setTimestamp();

          try {
            const embedId = await createEmbed(message.author.id, message.guild.id, customEmbed.data);
            await interaction.update({ content: `Custom embed created with ID: ${embedId}`, embeds: [], components: [] });
          } catch (error) {
            console.error('Error saving custom embed:', error);
            await interaction.reply({ content: 'An error occurred while saving the custom embed.', ephemeral: true });
          }
          return;
        }

        if (interaction.customId === 'placeholders') {
          const placeholderEmbed = getPlaceholdersEmbed();
          await interaction.reply({ embeds: [placeholderEmbed], ephemeral: true });
          return;
        }

        if (interaction.customId === 'color') {
          const colorModal = new ModalBuilder()
            .setCustomId('colorModal')
            .setTitle('Select Embed Color');

            const colorInput = new TextInputBuilder()
            .setCustomId('colorInput')
            .setLabel('Enter a color (hex code or name)')
            .setStyle('Short')
            .setValue('');

          const colorActionRow = new ActionRowBuilder().addComponents(colorInput);
          colorModal.addComponents(colorActionRow);

          await interaction.showModal(colorModal);

          try {
            const colorSubmitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
            if (colorSubmitted) {
              const color = colorSubmitted.fields.getTextInputValue('colorInput');
              customEmbed.setColor(color);
              if (!interaction.replied) {
                await interaction.update({ embeds: [customEmbed] });
              }
            }
          } catch (error) {
            console.error('Error handling color modal interaction:', error);
            if (!interaction.replied) {
              await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
          }
        } else {
          try {
            const modal = new ModalBuilder()
              .setCustomId(interaction.customId)
              .setTitle(`Edit ${interaction.component.label}`);

            const inputComponent = new TextInputBuilder()
              .setCustomId('inputField')
              .setLabel(`Enter ${interaction.component.label}`)
              .setStyle('Paragraph')
              .setValue('');

            const actionRow = new ActionRowBuilder().addComponents(inputComponent);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);

            const submitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
            if (submitted) {
              let value = submitted.fields.getTextInputValue('inputField');
              value = await replacePlaceholders(message, value);

              switch (interaction.customId) {
                case 'title':
                  customEmbed.setTitle(value);
                  break;
                case 'author':
                  customEmbed.setAuthor({ name: value });
                  break;
                case 'description':
                  customEmbed.setDescription(value);
                  break;
                case 'field':
                  const fieldModal = new ModalBuilder()
                    .setCustomId('fieldModal')
                    .setTitle('Add Field');

                  const nameInput = new TextInputBuilder()
                    .setCustomId('nameInput')
                    .setLabel('Field Name')
                    .setStyle('Short')
                    .setValue('');

                  const valueInput = new TextInputBuilder()
                    .setCustomId('valueInput')
                    .setLabel('Field Value')
                    .setStyle('Paragraph')
                    .setValue('');

                  const inlineInput = new TextInputBuilder()
                    .setCustomId('inlineInput')
                    .setLabel('Inline (true/false)')
                    .setStyle('Short')
                    .setValue('');

                  const fieldActionRow1 = new ActionRowBuilder().addComponents(nameInput);
                  const fieldActionRow2 = new ActionRowBuilder().addComponents(valueInput);
                  const fieldActionRow3 = new ActionRowBuilder().addComponents(inlineInput);

                  fieldModal.addComponents(fieldActionRow1, fieldActionRow2, fieldActionRow3);

                  await interaction.showModal(fieldModal);

                  try {
                    const fieldSubmitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
                    if (fieldSubmitted) {
                      const fieldName = fieldSubmitted.fields.getTextInputValue('nameInput');
                      let fieldValue = fieldSubmitted.fields.getTextInputValue('valueInput');
                      fieldValue = await replacePlaceholders(message, fieldValue);
                      const fieldInline = fieldSubmitted.fields.getTextInputValue('inlineInput') === 'true';

                      customEmbed.addFields({ name: fieldName, value: fieldValue, inline: fieldInline });
                      if (!interaction.replied) {
                        await interaction.update({ embeds: [customEmbed] });
                      }
                    }
                  } catch (error) {
                    console.error('Error handling field modal interaction:', error);
                    if (!interaction.replied) {
                      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
                    }
                  }
                  break;
                case 'footer':
                  customEmbed.setFooter({ text: value });
                  break;
                case 'image':
                  customEmbed.setImage(value);
                  break;
                case 'thumbnail':
                  customEmbed.setThumbnail(value);
                  break;
              }

              if (!interaction.replied) {
                await interaction.update({ embeds: [customEmbed] });
              }
            }
          } catch (error) {
            console.error('Error handling modal interaction:', error);
            if (!interaction.replied) {
              await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
          }
        }
      });

      collector.on('end', async () => {
        await sentMessage.edit({ components: [] });
      });
    } catch (error) {
      console.error('Error creating custom embed:', error);
      message.channel.send('An error occurred while creating the custom embed.');
    }
  },
  executeView: async (message, args) => {
    const embedId = args[0];

    if (!embedId) {
      return message.channel.send('Please provide the embed ID to view the custom embed.');
    }

    try {
      const embedData = await getEmbed(message.author.id, message.guild.id, embedId);

      if (!embedData) {
        return message.channel.send('Custom embed not found.');
      }

      const customEmbed = new EmbedBuilder(embedData);
      message.channel.send({ embeds: [customEmbed] });
    } catch (error) {
      console.error('Error retrieving custom embed:', error);
      message.channel.send('An error occurred while retrieving the custom embed.');
    }
  },
  executeEdit: async (message, args) => {
    const embedId = args[0];

    if (!embedId) {
      return message.channel.send('Please provide the embed ID to edit the custom embed.');
    }

    try {
      const embedData = await getEmbed(message.author.id, message.guild.id, embedId);

      if (!embedData) {
        return message.channel.send('Custom embed not found.');
      }

      const customEmbed = new EmbedBuilder(embedData);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('title')
            .setLabel('Title')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('author')
            .setLabel('Author')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('description')
            .setLabel('Description')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('field')
            .setLabel('Field')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('footer')
            .setLabel('Footer')
            .setStyle(ButtonStyle.Primary)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('color')
            .setLabel('Color')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('image')
            .setLabel('Image')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('thumbnail')
            .setLabel('Thumbnail')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('placeholders')
            .setLabel('Placeholders')
            .setStyle(ButtonStyle.Primary)
        );

      const row3 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('save')
            .setLabel('Save')
            .setStyle(ButtonStyle.Success)
        );

      const filter = (interaction) => interaction.user.id === message.author.id;

      const sentMessage = await message.channel.send({ content: 'Edit your custom embed:', embeds: [customEmbed], components: [row, row2, row3] });

      const collector = sentMessage.createMessageComponentCollector({ filter, time: 300000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'save') {
          try {
            await updateEmbed(message.author.id, message.guild.id, embedId, customEmbed.data);
            await interaction.update({ content: 'Custom embed updated successfully!', embeds: [], components: [] });
          } catch (error) {
            console.error('Error updating custom embed:', error);
            await interaction.reply({ content: 'An error occurred while updating the custom embed.', ephemeral: true });
          }
          return;
        }

        if (interaction.customId === 'placeholders') {
          const placeholderEmbed = getPlaceholdersEmbed();
          await interaction.reply({ embeds: [placeholderEmbed], ephemeral: true });
          return;
        }

        if (interaction.customId === 'color') {
          const colorModal = new ModalBuilder()
            .setCustomId('colorModal')
            .setTitle('Select Embed Color');

          const colorInput = new TextInputBuilder()
            .setCustomId('colorInput')
            .setLabel('Enter a color (hex code or name)')
            .setStyle('Short')
            .setValue('');

          const colorActionRow = new ActionRowBuilder().addComponents(colorInput);
          colorModal.addComponents(colorActionRow);

          await interaction.showModal(colorModal);

          try {
            const colorSubmitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
            if (colorSubmitted) {
              const color = colorSubmitted.fields.getTextInputValue('colorInput');
              customEmbed.setColor(color);
              if (!interaction.replied) {
                await interaction.update({ embeds: [customEmbed] });
              }
            }
          } catch (error) {
            console.error('Error handling color modal interaction:', error);
            if (!interaction.replied) {
              await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
          }
        } else {
          try {
            const modal = new ModalBuilder()
              .setCustomId(interaction.customId)
              .setTitle(`Edit ${interaction.component.label}`);

            const inputComponent = new TextInputBuilder()
              .setCustomId('inputField')
              .setLabel(`Enter ${interaction.component.label}`)
              .setStyle('Paragraph')
              .setValue('');

            const actionRow = new ActionRowBuilder().addComponents(inputComponent);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);

            const submitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
            if (submitted) {
              let value = submitted.fields.getTextInputValue('inputField');
              value = await replacePlaceholders(message, value);

              switch (interaction.customId) {
                case 'title':
                  customEmbed.setTitle(value);
                  break;
                case 'author':
                  customEmbed.setAuthor({ name: value });
                  break;
                case 'description':
                  customEmbed.setDescription(value);
                  break;
                case 'field':
                  const fieldModal = new ModalBuilder()
                    .setCustomId('fieldModal')
                    .setTitle('Add Field');

                  const nameInput = new TextInputBuilder()
                    .setCustomId('nameInput')
                    .setLabel('Field Name')
                    .setStyle('Short')
                    .setValue('');

                  const valueInput = new TextInputBuilder()
                    .setCustomId('valueInput')
                    .setLabel('Field Value')
                    .setStyle('Paragraph')
                    .setValue('');

                  const inlineInput = new TextInputBuilder()
                    .setCustomId('inlineInput')
                    .setLabel('Inline (true/false)')
                    .setStyle('Short')
                    .setValue('');

                  const fieldActionRow1 = new ActionRowBuilder().addComponents(nameInput);
                  const fieldActionRow2 = new ActionRowBuilder().addComponents(valueInput);
                  const fieldActionRow3 = new ActionRowBuilder().addComponents(inlineInput);

                  fieldModal.addComponents(fieldActionRow1, fieldActionRow2, fieldActionRow3);

                  await interaction.showModal(fieldModal);

                  try {
                    const fieldSubmitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
                    if (fieldSubmitted) {
                      const fieldName = fieldSubmitted.fields.getTextInputValue('nameInput');
                      let fieldValue = fieldSubmitted.fields.getTextInputValue('valueInput');
                      fieldValue = await replacePlaceholders(message, fieldValue);
                      const fieldInline = fieldSubmitted.fields.getTextInputValue('inlineInput') === 'true';

                      customEmbed.addFields({ name: fieldName, value: fieldValue, inline: fieldInline });
                      if (!interaction.replied) {
                        await interaction.update({ embeds: [customEmbed] });
                      }
                    }
                  } catch (error) {
                    console.error('Error handling field modal interaction:', error);
                    if (!interaction.replied) {
                      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
                    }
                  }
                  break;
                case 'footer':
                  customEmbed.setFooter({ text: value });
                  break;
                case 'image':
                  customEmbed.setImage(value);
                  break;
                case 'thumbnail':
                  customEmbed.setThumbnail(value);
                  break;
              }

              if (!interaction.replied) {
                await interaction.update({ embeds: [customEmbed] });
              }
            }
          } catch (error) {
            console.error('Error handling modal interaction:', error);
            if (!interaction.replied) {
              await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
          }
        }
      });

      collector.on('end', async () => {
        await sentMessage.edit({ components: [] });
      });
    } catch (error) {
      console.error('Error retrieving custom embed:', error);
      message.channel.send('An error occurred while retrieving the custom embed.');
    }
  },
  executeDelete: async (message, args) => {
    const embedId = args[0];

    if (!embedId) {
      return message.channel.send('Please provide the embed ID to delete the custom embed.');
    }

    try {
      const success = await deleteEmbed(message.author.id, message.guild.id, embedId);

      if (success) {
        message.channel.send('Custom embed deleted successfully!');
      } else {
        message.channel.send('Custom embed not found.');
      }
    } catch (error) {
      console.error('Error deleting custom embed:', error);
      message.channel.send('An error occurred while deleting the custom embed.');
    }
  },
  data: new SlashCommandBuilder()
  .setName('customembed')
  .setDescription('Manages custom embeds')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create')
      .setDescription('Creates a new custom embed')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('view')
      .setDescription('Views a custom embed')
      .addStringOption((option) =>
        option
          .setName('embedid')
          .setDescription('The ID of the custom embed to view')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('edit')
      .setDescription('Edits a custom embed')
      .addStringOption((option) =>
        option
          .setName('embedid')
          .setDescription('The ID of the custom embed to edit')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('Deletes a custom embed')
      .addStringOption((option) =>
        option
          .setName('embedid')
          .setDescription('The ID of the custom embed to delete')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('list')
      .setDescription('Lists your custom embeds')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('info')
      .setDescription('Provides information about the custom embed system')
  ),
executeSlash: async (interaction) => {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'create':
      await module.exports.executeCreate(interaction);
      break;
    case 'view':
      const viewEmbedId = interaction.options.getString('embedid');
      await module.exports.executeView(interaction, [viewEmbedId]);
      break;
    case 'edit':
      const editEmbedId = interaction.options.getString('embedid');
      await module.exports.executeEdit(interaction, [editEmbedId]);
      break;
    case 'delete':
      const deleteEmbedId = interaction.options.getString('embedid');
      await module.exports.executeDelete(interaction, [deleteEmbedId]);
      break;
    case 'list':
      await executeList(interaction);
      break;
    case 'info':
      await executeInfo(interaction);
      break;
    default:
      interaction.reply({ content: 'Invalid subcommand. Please use "create", "view", "edit", "delete", "list", or "info".', ephemeral: true });
  }
},
};
