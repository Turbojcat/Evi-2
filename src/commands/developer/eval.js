module.exports.run = async(bot, message, args) => {
    let command = args
    if(!command) return
    eval(command)
}


module.exports.help = {
    name:"eval",
    alias: [],
    cooldown:0,
    use_per_cooldown:1,
    deleted:true,
    description:"",
    permissions:{
        bot:"",
        user:"",
        role:""
    },
    developer:true,
    status:true
}