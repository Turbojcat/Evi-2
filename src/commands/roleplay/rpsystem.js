const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const fs = require("fs");
const path = require("path");

class RPCommand {
  constructor(name, commandData) {
    if (typeof commandData !== "object") {
      throw new Error("Command data is not an object");
    }
    if (!name || !commandData.description || !commandData.mention || !commandData.noMention || !commandData.victimString || !commandData.perpString) {
      throw new Error("Command data must include at least 'name', 'description', 'mention', 'noMention', 'victimString', 'perpString'");
    }

    this.name = name;
    this.desc = commandData.description;
    this.noMention = commandData.noMention;
    this.mention = commandData.mention;
    this.victimString = commandData.victimString;
    this.perpString = commandData.perpString;
    this.aliases = commandData.aliases || [];
    this.cooldown = commandData.cooldown || 0;
    this.use_per_cooldown = commandData.use_per_cooldown || 1;
    this.deleted = commandData.deleted || false;
    this.permissions = {
      bot: commandData.permissions?.bot || "",
      user: commandData.permissions?.user || "",
      role: commandData.permissions?.role || "",
    };
    this.dev = commandData.developer || false;
    this.status = commandData.status !== undefined ? commandData.status : true;
    this.commandData = commandData;
    this.ignoreNoMention = commandData.ignoreNoMention || false;

    this.setHelp();
  }

  async init(bot) {
    if ((bot.queries[`update_${this.name}_p`] && bot.queries[`update_${this.name}_p`]) || this.newlyCreated) {
      bot.commands.set(this.help.name, this);
    } else {
      await this.create(bot, this.commandData);
    }
  }

  async create(bot, commandData) {
    const name = this.name;

    if (bot.commands.has(this.name)) {
      return;
    }

    const createCommand = `ALTER TABLE profil ADD ${this.name}_p INT(200) NOT NULL DEFAULT 0, ADD ${this.name}_v INT(200) NOT NULL DEFAULT 0;`;

    try {
      await bot.db.query(createCommand);
    } catch (err) {
      console.error(`The creation of the new RP command ${this.name} failed:`, err);
    }

    const pQuery = `UPDATE profil SET ${this.name}_p=${this.name}_p+1 WHERE user_id=?`;
    const pQueryName = `update_${this.name}_p`;
    const vQuery = `UPDATE profil SET ${this.name}_v=${this.name}_v+1 WHERE user_id=?`;
    const vQueryName = `update_${this.name}_v`;

    const queriesFilePath = path.join(__dirname, "queries.json");
    const queriesData = await fs.promises.readFile(queriesFilePath, "utf-8");
    let queryData = JSON.parse(queriesData);

    if (!queryData[pQueryName] && !queryData[vQueryName]) {
      queryData[pQueryName] = pQuery;
      queryData[vQueryName] = vQuery;

      await fs.promises.writeFile(queriesFilePath, JSON.stringify(queryData, Object.keys(queryData).sort(), 4), "utf-8");
      bot.queries[pQueryName] = pQuery;
      bot.queries[vQueryName] = vQuery;
    }

    const rpFilePath = path.join(__dirname, "rp.json");
    const rpData = await fs.promises.readFile(rpFilePath, "utf-8");
    let cmdData = JSON.parse(rpData);

    if (!cmdData[name]) {
      cmdData[name] = commandData;
      await fs.promises.writeFile(rpFilePath, JSON.stringify(cmdData, null, 4), "utf-8");
    }

    this.newlyCreated = true;
    await this.init(bot);
  }

  async setHelp() {
    this.help = {
      name: this.name,
      alias: this.aliases,
      cooldown: this.cooldown,
      use_per_cooldown: this.use_per_cooldown,
      deleted: this.deleted,
      description: this.desc,
      permissions: this.permissions,
      developer: this.dev,
      status: this.status,
    };
  }

  async run(bot, message, args) {
    let userMessage = [],
      printString = [],
      usr = [];
    let numMentions = 0,
      stop = false;
    args = args.split(" ");

    for (const elem of args) {
      if (elem.match(/<@!?\d+>/g) && message.mentions.users.size > 0) {
        numMentions++;
      } else {
        break;
      }
    }

    args = args.slice(numMentions).join(" ");

    message.mentions.users.forEach((element) => {
      if (usr.length < numMentions) {
        printString.push(element.username);
        usr.push({ name: element.username, id: element.id });
      }
    });

    let author = await bot.db.query(bot.queries.get_profil, [message.author.id]);
    if (!this.ignoreNoMention || numMentions > 0) {
      await bot.db.query(bot.queries[`update_${this.name}_p`], [message.author.id]);
    }
    author = author[0];
    author[`${this.name}_p`]++;

    printString = [printString.slice(0, -1).join(", "), printString.slice(-1)[0]].join(printString.length < 2 ? "" : " and ");

    let authorMessage = [message.author.username, this.perpString, "and", this.victimString].join(" ");
    userMessage.push(authorMessage, "-------");

    for (let index = 0; index < usr.length; index++) {
      let user = await bot.db.query(bot.queries.get_profil, [usr[index].id]);
      if (!user || user.length === 0) {
        user = await bot.db.query(bot.queries.create_profil, [usr[index].id]);
        user[0][`${this.name}_p`] = 0;
        user[0][`${this.name}_v`] = 0;
      }
      user = user[0];

      await bot.db.query(bot.queries[`update_${this.name}_v`], [user.user_id]);

      user[`${this.name}_v`]++;
      if (user.user_id == author.user_id) {
        author[`${this.name}_v`]++;
      }

      let mentionedMessage = [usr[index].name, this.victimString, "and", this.perpString]
        .join(" ")
        .replace(/{v_num}/, user[`${this.name}_v`])
        .replace(/{p_num}/, user[`${this.name}_p`]);

      userMessage.push(mentionedMessage);
    }

    userMessage[0] = userMessage[0].replace(/{v_num}/, author[`${this.name}_v`]).replace(/{p_num}/, author[`${this.name}_p`]);

    let gifName = numMentions > 0 ? this.name : this.name + "_nomention";

    userMessage.push("\nA new roleplay system has been implemented. All stats have been reset as of 28/01.");

    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(bot.config.colors.main)
          .setAuthor({
            name: `${this.mention.includes("{author}") && numMentions > 0 ? "" : message.author.username} ${
              numMentions === 0 ? this.noMention : this.mention.replace(/{mentions}/, printString).replace(/{author}/, message.author.username)
            }`,
          })
          .setImage(bot.acts[gifName] ? bot.acts[gifName][bot.random(0, bot.acts[gifName].length - 1)] : null)
          .setFooter({ text: usr.length === 0 ? `${message.author.username} ${this.noMention}` : userMessage.join("\n") })
          .setDescription(`${args}`),
      ],
    });
  }

  async executeSlash(bot, interaction) {
    let userMessage = [],
      printString = [],
      usr = [];
    let numMentions = 0,
      stop = false;

    const mentions = interaction.options.getMentionable("mentions");

    if (mentions && mentions.length > 0) {
      numMentions = mentions.length;
      mentions.forEach((element) => {
        if (usr.length < numMentions) {
          printString.push(element.username);
          usr.push({ name: element.username, id: element.id });
        }
      });
    }

    let author = await bot.db.query(bot.queries.get_profil, [interaction.user.id]);
    if (!this.ignoreNoMention || numMentions > 0) {
      await bot.db.query(bot.queries[`update_${this.name}_p`], [interaction.user.id]);
    }
    author = author[0];
    author[`${this.name}_p`]++;

    printString = [printString.slice(0, -1).join(", "), printString.slice(-1)[0]].join(printString.length < 2 ? "" : " and ");

    let authorMessage = [interaction.user.username, this.perpString, "and", this.victimString].join(" ");
    userMessage.push(authorMessage, "-------");

    for (let index = 0; index < usr.length; index++) {
      let user = await bot.db.query(bot.queries.get_profil, [usr[index].id]);
      if (!user || user.length === 0) {
        user = await bot.db.query(bot.queries.create_profil, [usr[index].id]);
        user[0][`${this.name}_p`] = 0;
        user[0][`${this.name}_v`] = 0;
      }
      user = user[0];

      await bot.db.query(bot.queries[`update_${this.name}_v`], [user.user_id]);

      user[`${this.name}_v`]++;
      if (user.user_id == author.user_id) {
        author[`${this.name}_v`]++;
      }

      let mentionedMessage = [usr[index].name, this.victimString, "and", this.perpString]
        .join(" ")
        .replace(/{v_num}/, user[`${this.name}_v`])
        .replace(/{p_num}/, user[`${this.name}_p`]);

      userMessage.push(mentionedMessage);
    }

    userMessage[0] = userMessage[0].replace(/{v_num}/, author[`${this.name}_v`]).replace(/{p_num}/, author[`${this.name}_p`]);

    let gifName = numMentions > 0 ? this.name : this.name + "_nomention";

    userMessage.push("\nA new roleplay system has been implemented. All stats have been reset as of 28/01.");

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(bot.config.colors.main)
          .setAuthor({
            name: `${this.mention.includes("{author}") && numMentions > 0 ? "" : interaction.user.username} ${
              numMentions === 0 ? this.noMention : this.mention.replace(/{mentions}/, printString).replace(/{author}/, interaction.user.username)
            }`,
          })
          .setImage(bot.acts[gifName] ? bot.acts[gifName][bot.random(0, bot.acts[gifName].length - 1)] : null)
          .setFooter({ text: usr.length === 0 ? `${interaction.user.username} ${this.noMention}` : userMessage.join("\n") })
          .setDescription(`${interaction.options.getString("message") || ""}`),
      ],
    });
  }
}

module.exports.init = async (bot, category) => {
  const rpFilePath = path.join(__dirname, "rp.json");
  const rpData = await fs.promises.readFile(rpFilePath, "utf-8");
  const commands = JSON.parse(rpData);

  const actionsFilePath = path.join(__dirname, "actions.json");
  const actionsData = await fs.promises.readFile(actionsFilePath, "utf-8");
  const actions = JSON.parse(actionsData);

  let numRPCommands = 0;

  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      numRPCommands++;
      const cmd = new RPCommand(key, commands[key]);
      await cmd.init(bot);
      cmd.help.category = category;

      // Register prefix-based command
      bot.commands.set(cmd.name, cmd);

      // Register slash command
      if (!bot.slashCommands.has(cmd.name)) {
        bot.slashCommands.set(cmd.name, {
          name: cmd.name,
          description: cmd.desc,
          options: [
            {
              name: "mentions",
              description: "Users to mention in the RP command",
              type: ApplicationCommandOptionType.Mentionable,
              required: false,
            },
            {
              name: "message",
              description: "Optional message to include with the RP command",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        });
      }

      if (actions[key]) {
        bot.acts[key] = actions[key];
      }
    }
  }

  console.log(`\x1b[32m[VALID]\x1b[33m Starter : ${numRPCommands} RP-kommandoer`);
};
