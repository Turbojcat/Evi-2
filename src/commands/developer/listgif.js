const path = require('path');
const fs = require('fs');
const { developerIDs, RPaddUserID } = require(path.resolve(__dirname, '../../config.js'));

class ListGif {
  constructor(name) {
    this.name = name;
    this.developer = true;
    this.description = "List GIFs for a roleplay command";
  }

  async run(bot, message, args) {
    const isDeveloper = developerIDs.includes(message.author.id);
    const canAddRPCommands = RPaddUserID.includes(message.author.id);

    if (!isDeveloper && !canAddRPCommands) {
      return message.channel.send("You don't have permission to use this command.");
    }

    const [commandName, subCommand] = args.split(' ');

    if (!commandName) {
      return message.channel.send("Please provide the name of the RP command.\nSyntax: listgif <rpCommand> [nomention]");
    }

    let lookupArg = commandName;

    if (subCommand === "nomention") {
      lookupArg += "_nomention";
    }

    try {
      const actionsFilePath = path.resolve(__dirname, '../roleplay/actions.json');
      const actionsData = await fs.promises.readFile(actionsFilePath, 'utf-8');
      const parsedActions = JSON.parse(actionsData);

      if (!parsedActions[lookupArg]) {
        return message.channel.send(`I have no GIFs for ${lookupArg}`);
      }

      const gifList = parsedActions[lookupArg].join('\n');
      message.channel.send(`GIFs for ${lookupArg}:\n${gifList}`);
    } catch (error) {
      console.error('Error reading actions.json:', error);
      message.channel.send('An error occurred while reading the GIFs.');
    }
  }
}

module.exports = {
  name: 'listgif',
  description: 'List GIFs for a roleplay command',
  category: 'developer',
  init: async (bot) => {
    const listGif = new ListGif("listgif");
    bot.commands.set(listGif.name, listGif);
  },
  ListGif: ListGif,
};
