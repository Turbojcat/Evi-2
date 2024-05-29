const { MessageEmbed } = require("discord.js")
fs = require("fs")

/*
 * Class used to setup all RP commands running on Ava.
 * All RP commands perform the same actions. Setting up 
 * a class to abstract this behaviour allows for easy
 * creation of new commands
 * 
 * params: 
 * name = string name for the command for users to use in the Discord app
 * desc = Description of the command's purpose ("Hugs the user" etc)
 * noMention = Text to show if the author doesn't mention anyone
 * mention = text to show if the author mentions other users.
 *      Responds to the pattern {mentions} which it replaces with the username of all mentioned users
 *      and the pattern {author}. If this is not specified, author username will be the first word of the response.
 * 
 * All RP commands have feedback strings. These have parts that are customized to the relevant command.
 * Message is built up like this:
 * victimName, victimString, "and", perpString
 * For example: UserA, "got hugged {5} times", "and", "hugged others {1} times" 
 * victimString = String for the user targetted by the RP action
 * perpString = String for the user performing the RP action
 * 
 * commandData variables:
 * aliases = The command can have aliases to enable either longer or shorter versions of the command | default: []
 * cooldown = Something something, Amelia please enlighten me | default: 0
 * user_per_cooldown = see the above message | default: 1
 * deleted = Deletes the message sent by the author | default: false 
 * permissions ^ | default: {bot:", user:"", role=""}
 * status = ^ | default: true
 * dev = boolean value to set if the command is only available to developers | default: false
 * commandData | Raw input data stored for usage in case of new creation from file
 * ignoreNoMention | Database isn't updated if users aren't mentioned. Used for commands where a noMention means the author requests an action
*/
class RPCommand {
    // Initializing the RP command. 
    constructor(name, commandData) {
        try {
            if (typeof(commandData) !== "object") throw "Command data is not an object"
            if (!name || !commandData || !commandData.description || !commandData.mention || !commandData.noMention || !commandData.victimString || !commandData.perpString) {
                throw "Command data must incluse at least 'name', 'description', 'mention', 'noMention', 'victimString', 'perpString'"
            }
        } catch (err) {
            console.error(err)
        }
        this.name = name
        this.desc = commandData.description
        this.noMention = commandData.noMention
        this.mention = commandData.mention
        this.victimString = commandData.victimString
        this.perpString = commandData.perpString
        this.aliases = commandData.aliases ? commandData.aliases : []
        this.cooldown = commandData.cooldown ? commandData.cooldown : 0
        this.use_per_cooldown = commandData.use_per_cooldown ? commandData.use_per_cooldown : 1
        this.deleted = commandData.deleted ? commandData.deleted : false
        this.permissions = {bot:"", user:"", role:""}
        if (commandData.permissions) {
            this.permissions.bot = commandData.permissions.bot ? commandData.permissions.bot : ""
            this.permissions.user = commandData.permissions.user ? commandData.permissions.user : ""
            this.permissions.role = commandData.permissions.role ? commandData.permissions.role : ""
        }
        this.dev = commandData.developer ? commandData.developer : false
        this.status = commandData.status ? commandData.status : true
        this.commandData = commandData
        this.ignoreNoMention = commandData.ignoreNoMention ? commandData.ignoreNoMention : false

        this.setHelp()
    }

    // Loads the command into bot memory
    init = async(bot) => {
        if ((bot.queries[`update_${this.name}_p`] && bot.queries[`update_${this.name}_p`]) || this.newlyCreated) {
            bot.commands.set(this.help.name, this)
        } else {
            this.create(bot, this.commandData)
        }
    }

    // Creates a new command if the command does not exist
    create = async(bot, commandData) => {
        // For use in callbacks
        const name = this.name

        // We can't recreate a command that exists
        if(bot.commands.hasOwnProperty(this.name)) {
            return
        }
        // SQL query to create new entries in database
        let createCommand = `ALTER TABLE profil ADD ${this.name}_p INT(200) NOT NULL DEFAULT 0, ADD ${this.name}_v INT(200) NOT NULL DEFAULT 0;`

        // Creating new columns. Throws error if it fails
        try {
            await bot.db.query(createCommand)
        } catch(err) {
            console.error(`The creation of the new RP command ${this.name} failed:`, err)
        }

        // Defining update queries to be written to file
        const pQuery = `UPDATE profil SET ${this.name}_p=${this.name}_p+1 WHERE user_id=?`
        const pQueryName = `update_${this.name}_p`
        const vQuery = `UPDATE profil SET ${this.name}_v=${this.name}_v+1 WHERE user_id=?`
        const vQueryName = `update_${this.name}_v`

        // Parsing file and writing queries
        await fs.readFile("json/queries.json", "utf-8", async(err, data) => {
            try {
                if(err) throw err

                let queryData = JSON.parse(data)
                // Queries are already registered in file
                if(queryData[pQueryName] && queryData[vQueryName]) {
                    return
                }
                queryData[pQueryName] = pQuery
                queryData[vQueryName] = vQuery

                await fs.writeFile("json/queries.json", JSON.stringify(queryData, Object.keys(queryData).sort(), 4), "utf-8", function(err) {
                    if (err) throw err
                    bot.queries[pQueryName] = pQuery
                    bot.queries[vQueryName] = vQuery
                })
            } catch (err) {
                console.error(err)
            }
        })

        // Parsing command file and writing new command to file
        await fs.readFile("json/rp.json", "utf-8", async(err, data) => {
            try {
                if (err) throw err

                let cmdData = JSON.parse(data)
                // Command is already registered in file
                if(cmdData[name]) {
                    return
                }
                cmdData[name] = commandData

                await fs.writeFile("json/rp.json", JSON.stringify(cmdData, null, 4), "utf-8", function(err) {
                    if (err) throw err
                })

            } catch (err) {
                console.error(err)
            }
        })

        this.newlyCreated = true
        this.init(bot)
    }

    // Sets the help command for the relevant command
    async setHelp() {
        let help = {
        name: this.name,
        alias: this.aliases,
        cooldown: this.cooldown,
        use_per_cooldown: this.use_per_cooldown,
        deleted: this.deleted,
        description: this.desc,
        permissions: this.permissions,
        developer: this.dev,
        status: this.status
        }
        this.help = help
    }

    // Runs the RP command when a user writes it
    async run(bot, message, args) {
        let userMessage = [], printString = [], usr = []
        let numMentions = 0, stop = false
        args = args.split(" ")

        // Find number of mentions to separate from mentions in author's message
        for (const elem of args) {
            if(elem.match(/<@[\D]?\d+>/g) && message.mentions.users.size > 0) {
                numMentions++;
            } else {
                break;
            }
        }

        // Rejoin args, removing user mentions from the start of the message
        args = args.slice(numMentions).join(" ")

        // Get every user mentioned by name and ID
        message.mentions.users.forEach(element => {
            if(usr.length < numMentions) {
                printString.push(element.username)
                usr.push({name: element.username, id: element.id})
            }
        })

        // Fetch author stats
        let author = await bot.db.query(bot.queries.get_profil,[message.author.id])
        if(!this.ignoreNoMention || numMentions > 0) {
            await bot.db.query(bot.queries[`update_${this.name}_p`],[message.author.id])
        }
        author = author[0]
        author[`${this.name}_p`]++;

        // Creates a printable "a, b, c and d" string for embed "author" field
        printString = [printString.slice(0, -1).join(', '), printString.slice(-1)[0]].join(printString.length < 2 ? '' : ' and ')

        let authorMessage = [message.author.username, this.perpString, "and", this.victimString].join(" ")
        userMessage.push(authorMessage, "-------")

        for (let index = 0; index < usr.length; index++) {

            // Fetch victim profile
            let user = await bot.db.query(bot.queries.get_profil,[usr[index].id])
            if(!user || user.length === 0){
                // Returning statement only contains user_id, so we create the required fields
                user = await bot.db.query(bot.queries.create_profil,[usr[index].id])
                user[0][`${this.name}_p`] = 0
                user[0][`${this.name}_v`] = 0
            } 
            user = user[0] // All SQL responses are arrays of RowDataPacket types, so we get the first entry

            // Updating user profile with new values
            await bot.db.query(bot.queries[`update_${this.name}_v`],[user.user_id])

            user[`${this.name}_v`]++;
            if(user.user_id == author.user_id) {
                author[`${this.name}_v`]++;
            }

            // Creating the footer message to print the number of time the user has been victim and perpetrator
            let mentionedMessage = [usr[index].name, this.victimString, "and", this.perpString]
            .join(" ")
            .replace(/{v_num}/, user[`${this.name}_v`])
            .replace(/{p_num}/, user[`${this.name}_p`])
            
            userMessage.push(mentionedMessage)
        }
        // Author stats may be adjusted if author mentions himself. So we wait with the replace until after the for loop
        userMessage[0] = userMessage[0] // Author will always be at index 0
        .replace(/{v_num}/, author[`${this.name}_v`]) 
        .replace(/{p_num}/, author[`${this.name}_p`]) 

        // If no user is mentioned, gifs are fetched from command_nomention version
        let gifName = numMentions > 0 ? this.name : this.name + "_nomention"

        // Temporary information about the reset of stats
        userMessage.push("\nA new roleplay system has been implemented. All stats have been reset as of 28/01.")

        // Generating and sending the message
        message.channel.send(new MessageEmbed()
        .setColor(bot.config.colors.main)
        .setAuthor(`${this.mention.includes("{author}") && numMentions > 0 ? "" : message.author.username } ${numMentions === 0 ? this.noMention : this.mention.replace(/{mentions}/, printString).replace(/{author}/, message.author.username)}`)
        .setImage(bot.acts[gifName] ? bot.acts[gifName][bot.random(0, bot.acts[gifName].length - 1)] : null)
        .setFooter(usr.length === 0  ? `${message.author.username} ${this.noMention}` : userMessage.join("\n"))
        .setDescription(`${args}`))
    }
}

module.exports.init = async(bot, category) => {
    const commands = JSON.parse(fs.readFileSync("json/rp.json","utf8"))
    let numRPCommands = 0
    // Reads all keys in the rp.json file and sets up the commands listed 
    for(let key in commands) {
        if (commands.hasOwnProperty(key)) {
            numRPCommands++
            const cmd = new RPCommand(key, commands[key])
            cmd.init(bot)
            cmd.help.category = category
        }
   }
    console.log("\x1b[32m[VALID]\x1b[33m Starter : "+ numRPCommands + " RP-kommandoer")
}