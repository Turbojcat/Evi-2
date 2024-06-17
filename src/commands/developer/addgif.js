const { MessageEmbed } = require("discord.js")
var fs = require('fs')
var path = require('path')

module.exports.help = {
    name: "addgif",
    alias: [],
    cooldown: 0,
    use_per_cooldown: 1,
    deleted: false,
    description: "Adds a gif to the commands",
    permissions:{
        bot: "",
        user: "",
        role: ""
    },
    developer: true,
    status: true
}

module.exports.run = async(bot, message, args) => {
    if(!bot.config.gifadd.includes(message.author.id)) {
        message.channel.send("You do not have permission to use this command")
        return 0
    }
    let lookupArg = ""
    args = args.split(" ")
    if (!args[1]) {
        message.channel.send("I'm sorry, you didn't write the command correctly.\nSyntax: addgif _rpCommand_ _URL_ [_nomention_]")
        return
    }

    fs.readFile(path.resolve(__dirname, '../../json/actions.json'), 'utf-8', function(err, data) {
        if (err) throw err

        if (args[2] === "nomention") {
            lookupArg = `${args[0]}_${args[2]}`
        } else lookupArg = args[0]

        var arrayOfObjects = JSON.parse(data)
        if (!arrayOfObjects[lookupArg]) {
            arrayOfObjects[lookupArg] = []
            bot.acts[lookupArg] = []
        }
        arrayOfObjects[lookupArg].push(args[1])
        fs.writeFile(path.resolve(__dirname ,'../../json/actions.json'), JSON.stringify(arrayOfObjects, null, 4), 'utf-8', function(err) {
            if (err) throw err
            bot.acts[lookupArg].push(args[1])
            console.log(bot.acts[lookupArg])
            message.channel.send(`Added ${args[1]} to ${lookupArg}!`)
            message.channel.send(`I now have ${bot.acts[lookupArg].length} GIFs for ${lookupArg}`)
        })
    })
}