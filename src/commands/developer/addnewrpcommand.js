const rpc = require("../roleplay/rpsystem.js");
const fs = require("fs");
const path = require("path");
const { developerIDs, RPaddUserID, colors } = require("../../config.js");

module.exports.run = async (bot, message, args) => {
  const isDeveloper = developerIDs.includes(message.author.id);
  const canAddRPCommands = RPaddUserID.includes(message.author.id);

  if (!isDeveloper && !canAddRPCommands) {
    return message.channel.send("You don't have permission to add new RP commands.");
  }

  // Arg must be a JSON formatted string
  if (args[0] === "{") {
    try {
      var input = JSON.parse(args);
    } catch (err) {
      let msg = {
        color: colors.red, // Red color for error messages
        author: {
          name: "Improperly formatted RP command",
          icon_url: bot.user.displayAvatarURL(),
        },
        description: `\`${err.message}\``,
        footer: {
          text: 'Tip: All words must be surrounded by ", for example "name": "boop".\nType <prefix> help rpnew for more help',
        },
      };
      console.log(msg);
      message.channel.send({ embed: msg });
      return;
    }
  } else {
    message.channel.send("New RP command has to be a valid JSON object");
    return;
  }

  if (!input.name || !input.description || !input.mention || !input.noMention || !input.victimString || !input.perpString) {
    message.channel.send(
      "New RP commands require at minimum the following setup: \n\
            ```js\n\
{\n\
    name: 'name of the command'\n\
    description: 'Description for the help command'\n\
    mention: 'title to print when other users are mentioned'\n\
    noMention: 'title to print when no users are mentioned'\n\
    victimString: 'string with number of times user has been receiver of this | I.e: was kissed {v_num} times'\n\
    perpString: 'string with number of times user has performed the action | I.e kissed others {p_num} times'\n}```"
    );
    return;
  }

  const name = input.name;

  // Command exists, we won't add it again
  if (bot.commands.has(name)) {
    message.channel.send("This command already exists. I can't overwrite the old command.");
    return;
  }

  // Update queries.json
  const queriesFilePath = path.join(__dirname, "../roleplay/queries.json");
  const queries = JSON.parse(fs.readFileSync(queriesFilePath, "utf8"));
  const pQueryName = `update_${name}_p`;
  const vQueryName = `update_${name}_v`;
  queries[pQueryName] = `UPDATE profil SET ${name}_p=${name}_p+1 WHERE user_id=?`;
  queries[vQueryName] = `UPDATE profil SET ${name}_v=${name}_v+1 WHERE user_id=?`;
  fs.writeFileSync(queriesFilePath, JSON.stringify(queries, null, 2));

  // Update actions.json
  const actionsFilePath = path.join(__dirname, "../roleplay/actions.json");
  const actions = JSON.parse(fs.readFileSync(actionsFilePath, "utf8"));
  actions[name] = [];
  fs.writeFileSync(actionsFilePath, JSON.stringify(actions, null, 2));

  // Update rp.json
  const rpFilePath = path.join(__dirname, "../roleplay/rp.json");
  const rpData = JSON.parse(fs.readFileSync(rpFilePath, "utf8"));
  rpData[name] = {
    description: input.description,
    mention: input.mention,
    noMention: input.noMention,
    victimString: input.victimString,
    perpString: input.perpString,
  };
  fs.writeFileSync(rpFilePath, JSON.stringify(rpData, null, 2));

  let cmd = new rpc.RPCommand(name, input);
  await cmd.create(bot, input);

  message.channel.send(`New RP command "${name}" has been added successfully!`);
};

module.exports.help = {
  name: "rpnew",
  alias: [],
  cooldown: 0,
  use_per_cooldown: 1,
  deleted: false,
  description:
    "Add RP commands. JSON object with the following structure is needed:\n\
    ```js\n\
{\n\
    name: 'name of the command'\n\
    description: 'Description for the help command'\n\
    mention: 'title to print when other users are mentioned'\n\
    noMention: 'title to print when no users are mentioned'\n\
    victimString: 'string with number of times user has been receiver of this | I.e: was kissed {v_num} times'\n\
    perpString: 'string with number of times user has performed the action | I.e kissed others {p_num} times'\n}```",
  permissions: {
    bot: "",
    user: "ADMINISTRATOR",
    role: "",
  },
  developer: true,
  status: true,
};
