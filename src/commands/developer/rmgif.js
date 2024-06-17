const path = require('path');
const fs = require('fs');
const { developerIDs, RPaddUserID } = require(path.resolve(__dirname, '../../config.js'));

class RmGif {
  constructor(name) {
    this.name = name;
    this.developer = true;
    this.description = "Remove a GIF from a roleplay command";
  }

  async run(bot, message, args) {
    const isDeveloper = developerIDs.includes(message.author.id);
    const canAddRPCommands = RPaddUserID.includes(message.author.id);

    if (!isDeveloper && !canAddRPCommands) {
      return message.channel.send("You don't have permission to use this command.");
    }

    const [commandName, gifURL, subCommand] = args.split(' ');

    if (!commandName || !gifURL) {
      return message.channel.send("Please provide the RP command and the GIF URL.\nSyntax: rmgif <rpCommand> <URL> [nomention]");
    }

    let lookupArg = commandName + (subCommand ? `_${subCommand}` : "");

    try {
      const actionsFilePath = path.resolve(__dirname, '../roleplay/actions.json');
      const actionsData = await fs.promises.readFile(actionsFilePath, 'utf-8');
      const parsedActions = JSON.parse(actionsData);

      if (!parsedActions[lookupArg]) {
        return message.channel.send(`I have no GIFs for ${lookupArg}, so I have nothing to delete.`);
      }

      const newGifs = parsedActions[commandName].filter(gif => gif !== gifURL);

      parsedActions[lookupArg] = newGifs;

      await fs.promises.writeFile(actionsFilePath, JSON.stringify(parsedActions, null, 4), 'utf-8');

      bot.acts[lookupArg] = newGifs;

      message.channel.send(`Removed ${gifURL} from ${lookupArg}!`);
      message.channel.send(`I now have ${bot.acts[lookupArg].length} GIFs for ${lookupArg}.`);
    } catch (error) {
      console.error('Error updating actions.json:', error);
      message.channel.send('An error occurred while removing the GIF.');
    }
  }
}

module.exports = {
  name: 'rmgif',
  description: 'Remove a GIF from a roleplay command',
  category: 'developer',
  init: async (bot) => {
    const rmGif = new RmGif("rmgif");
    bot.commands.set(rmGif.name, rmGif);
  },
  RmGif: RmGif,
};
