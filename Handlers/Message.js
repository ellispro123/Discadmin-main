const Discord = require("discord.js");
const fs = require("fs");
cache = require("../BotData/varcache");
usercache = require("../BotData/usercache");
var userCache = usercache.memoryCache.users;
const Functions = require("../DiscordFunctions");
const Papa = require("papaparse");
const path = require("path");
var breakFailure = true;
vars = {};
var DBS;
var geval = eval;

module.exports.Message_Handle = async function (dbs, msg, command, index, args) {
    DBS = dbs;
    msg.args = args;
    var hasPermission = false;
    var action = command.actions[index];
    this.RunAction(dbs.Bot, msg, action, dbs);
    dbs.callNextAction(command, msg, args, index + 1);
};

module.exports.RunAction = async function (client, msg, action) {
    var parsedAction = ParseActionVariables(action, msg);
    console.log("parsed: ");
    console.log(parsedAction);
    switch (action.type) {
        case "Send Message":
            await this.SendMessage_Handle(msg, client, parsedAction);
            break;
        case "Send Image":
            await this.SendImage_Handle(msg, client, parsedAction);
            break;
        case "Send Embed":
            await this.SendEmbed_Handle(msg, client, parsedAction);
            break;
        case "Add Role to User":
            this.AddRoleToUser_Handle(msg, client, parsedAction);
            break;
        case "Send Random Image":
            this.SendRandomImage_Handle(msg, client, parsedAction);
            break;
        case "Kick User":
            this.KickUser_Handle(msg, client, parsedAction);
            break;
        case "Ban User":
            this.BanUser_Handle(msg, client, parsedAction);
            break;
        case "Role Reaction Menu":
            this.RoleReactionMenu_Handle(msg, client, parsedAction);
            break;
        case "Create Channel":
            this.CreateChannel_Handle(msg, client, parsedAction);
            break;
        case "Store Value in Variable":
            StoreValeinVariable_Handle(msg, client, action);
            break;
        case "Set Bot Game":
            this.SetBotGame_Handle(msg, client, parsedAction);
            break;
        case "Set Status":
            this.SetStatus_Handle(msg, client, parsedAction);
            break;
        case "Set Avatar":
            this.SetAvatar_Handle(msg, client, parsedAction);
            break;
        case "Delete Channel":
            this.DeleteChannel_Handle(msg, client, parsedAction);
            break;
        case "Delete All Messages":
            this.DeleteAllMessages_Handle(msg, client, parsedAction);
            break;
        case "Get Mentioned User":
            StoreValeinVariable_Handle(msg, client, parsedAction);
            break;
        case "Add Role to Server":
            this.AddRoletoServer_Handle(msg, client, parsedAction);
            break;
        case "Get Command Author":
            StoreValeinVariable_Handle(msg, client, parsedAction);
            break;
        case "Set User Data":
            this.SetUserData_Handle(msg, client, parsedAction);
            break;
        case "Get User Data":
            StoreValeinVariable_Handle(msg, client, parsedAction);
            break;
        case "Edit User Data":
            EditUserData(msg, client, parsedAction);
            break;
        case "Get Command Channel":
            StoreValeinVariable_Handle(msg, client, parsedAction);
            break;
        case "Check User Data":
            this.CheckUserData(msg, client, parsedAction);
            break;
        case "Get Row":
            this.GetRow_Handle(msg, client, parsedAction);
            break;
        case "Generate Random Number":
            StoreValeinVariable_Handle(msg, client, parsedAction);
            break;
        case "Edit Variable":
            this.EditVariable_Handle(msg, client, parsedAction);
            break;
        case "Check Variable Value":
            this.CheckVariableValue_Handle(msg, client, parsedAction);
            break;
        case "Check User Permissions":
            this.CheckUserPermissions_Handle(msg, client, parsedAction);
            break;
    }
};

module.exports.GetMentionedUser_Handle = function (msg, client, action) {
    console.log("getting mentioned user");
    console.log(msg.mentions.members.first());
};

function ParseActionVariables(action, msg) {
    console.log("action");
    console.log(action);
    var newaction = Object.assign({}, action);
    if (action.fields) {
        newaction.fields = JSON.parse(JSON.stringify(action.fields));
    } else {
        newaction.fields = [];
    }

    regex = /%%(\w+)\[([\w\s]+)\]%%/g; ///%%(.*?)%%/g;
    var regex1 = /%%(.*?)%%/g;
    // Get the array of current variables
    Object.keys(newaction).forEach(e => {
        try {
            if (e !== "trueActions" && e !== "falseActions" && e !== "fields" && e !== "permissions") {
                var newVal = newaction[e];
                newVal = newVal.replace("$$CommandChannel$$", msg.channel.name);
                newVal = newVal.replace("$$CommandAuthor$$", msg.author.id);
                newVal = newVal.replace("$$AuthorDisplayName$$", msg.member.displayName);
                newVal = newVal.replace("$$AuthorAvatar$$", msg.author.avatarURL);
                newVal = newVal.replace("$$DefaultChannel$$", Functions.getDefaultChannel(msg.guild));
                newVal = newVal
                    .replace("$$ServerIcon$$", msg.guild.iconURL)
                    .replace("$$MemberCount$$", msg.guild.memberCount.toString())
                    .replace("$$JoinedAt$$", msg.guild.joinedAt.toString())
                    .replace("$$ServerName$$", msg.guild.name)
                    .replace("$$ServerOwner$$", msg.guild.owner.id)
                    .replace("$$ServerRegion$$", msg.guild.region)
                    .replace("$$VerificationLevel$$", msg.guild.verificationLevel.toString());
                newaction[e] = newVal;
            } else if (e === "fields") {
                Array.prototype.forEach.call(newaction[e], child => {
                    var newVal = child.value;
                    newVal = newVal.replace("$$CommandChannel$$", msg.channel.name);
                    newVal = newVal.replace("$$CommandAuthor$$", msg.author.id);
                    newVal = newVal.replace("$$AuthorDisplayName$$", msg.member.displayName);
                    newVal = newVal.replace("$$AuthorAvatar$$", msg.author.avatarURL);
                    newVal = newVal.replace("$$DefaultChannel$$", Functions.getDefaultChannel(msg.guild));
                    newVal = newVal
                        .replace("$$ServerIcon$$", msg.guild.iconURL)
                        .replace("$$MemberCount$$", msg.guild.memberCount.toString())
                        .replace("$$JoinedAt$$", msg.guild.joinedAt.toString())
                        .replace("$$ServerName$$", msg.guild.name)
                        .replace("$$ServerOwner$$", msg.guild.owner.id)
                        .replace("$$ServerRegion$$", msg.guild.region)
                        .replace("$$VerificationLevel$$", msg.guild.verificationLevel.toString());
                    child.value = newVal;
                });
            }
        } catch (err) {
            console.log(err);
        }
        //console.log(`key=${e}  value=${action[e]}`)
    });

    if (cache[msg.guild.id]) {
        cache[msg.guild.id].variables.forEach(sv => {
            //console.log(sv);
            if (sv.type == "Text" || sv.type == "Number" || sv.type == "User" || sv.type == "Channel" || sv.type == "row") {
                vars[sv.name] = sv.value;
            }
        });
        Object.keys(newaction).forEach(e => {
            try {
                if (e !== "trueActions" && e !== "falseActions" && e !== "fields" && e !== "permissions") {
                    var newVal = newaction[e].replace(regex, (_match, group1, group2) => vars[group1][group2]);

                    newVal = newVal.replace(regex1, (_match, group1) => vars[group1]);
                    newaction[e] = newVal;
                } else if (e === "fields") {
                    /*newaction[e].foreach(fieldString => {
                        consolg.log(fieldString);
                    });*/
                    Array.prototype.forEach.call(newaction[e], child => {
                        var newValF = child.value.replace(regex, (_match, group1, group2) => vars[group1][group2]);
                        newValF = newValF.replace(regex, (_match, group1) => vars[group1]);
                        child.value = newValF;
                    });
                }
            } catch (err) {
                console.log(err);
            }
        });
    }
    return newaction;
}

module.exports.SendMessage_Handle = async function (msg, client, action) {
    const chan = msg.guild.channels.find(ch => ch.name === action.channelname);
    // Validate channel name
    if (!chan && action.channelname != "") {
        console.log("ERROR: No channel found with name: " + action.channelname + ". Action name: " + action.name);
    } else if (action.channelname == "" && msg != "") {
        //await msg.channel.send(eval("`" + action.messagetext + "`"));
        msg.channel.send(eval("`" + action.messagetext + "`"));
    } else {
        //await chan.send(eval("`" + action.messagetext + "`"));
        chan.send(eval("`" + action.messagetext + "`"));
    }
};

module.exports.SendImage_Handle = async function (msg, client, action) {
    const chan = msg.guild.channels.find(ch => ch.name === action.channelname);
    // Validate channel
    if (!chan && action.channelname != "") {
        console.log("ERROR: No channel found with name: " + action.channelname + ". Action name: " + action.name);
    } else if (action.channelname == "" && msg != "") {
        msg.channel.send({ files: [action.url] });
    } else {
        chan.send({ files: [action.url] });
    }
};

module.exports.SendEmbed_Handle = async function (msg, client, action) {
    const Embed = new Discord.RichEmbed()
        .setColor(action.color)
        .setTitle(action.title)
        .setURL(action.url)
        .setAuthor(action.authorname, action.authorimageurl, action.authorlink)
        .setDescription(action.description)
        .setThumbnail(action.thumbnail)
        .setImage(action.image)
        .setFooter(action.footer);
    if (action.timestamp == "BOOL_TRUE@@") {
        Embed.setTimestamp();
    }

    if (action.fields) {
        action.fields.forEach(field => {
            var inlineTrue = field.inline == "true";
            if (field.name !== "" && field.value !== "") Embed.addField(field.name, field.value, inlineTrue);
        });
    }

    const chan = msg.guild.channels.find(ch => ch.name === action.channelname);
    // Validate channel
    if (!chan && action.channelname != "") {
        console.log("ERROR: No channel found with name: " + action.channelname + ". Action name: " + action.name);
    } else if (action.channelname == "" && msg != "") {
        msg.channel.send(Embed);
    } else {
        chan.send(Embed);
    }
};

module.exports.AddRoleToUser_Handle = function (msg, client, action) {
    var bot;
    var roleImport = [];
    msg.guild.members.forEach(mem => {
        if (mem.user.tag == client.user.tag) {
            bot = mem;
        }
    });
    bot.roles.forEach(element => {
        roleImport.push(element.position);
    });

    //var usertag = msg.content.split(" ")[1];
    var botRole = Math.max.apply(Math, roleImport);

    //Make sure user who sent command has high enough role
    var rolel = msg.guild.roles.find(role => role.name == action.rolename);
    if (rolel.position >= botRole) {
        console.log("ERROR: The bot must have a role higher than the one it is assigning");
    } else {
        if (!rolel) {
            console.log("ERROR: The Role: " + action.rolename + " does not exist");
        } else {
            if (action.user === "" || action.user == "undefined") {
                msg.member.addRole(rolel);
            } else {
                let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);

                if (mem) {
                    mem.addRole(rolel);
                } else {
                    console.log("ERROR: Could not find user with tag: " + action.user);
                }
            }
        }
    }
};

module.exports.SendRandomImage_Handle = function (msg, client, action) {
    var count = action.urls.length;
    var rand = Math.floor(Math.random() * count);
    var channel = action.channelname;
    var chan = msg.guild.channels.find(ch => ch.name === channel);
    if (!chan && channel != "") {
        console.log("ERROR: No channel found with name: " + channel);
    } else if (channel == "" && msg != "") {
        msg.channel.send({ files: [action.urls[rand]] });
    } else {
        chan.send({ files: [action.urls[rand]] });
    }
};

module.exports.KickUser_Handle = function (msg, client, action) {
    var member = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);

    // Get the reason string
    var reason = action.reason;

    if (member) {
        member
            .kick(reason)
            .then(member => {
                console.log("Kicked member");
            })
            .catch(() => {
                console.log("ERROR: Failed to kick user. Invalid message format or lack of permissions.");
            });
    } else {
        console.log("ERROR: Member to be kicked not found");
    }
};

module.exports.BanUser_Handle = function (msg, client, action) {
    var member = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);

    var options = {};
    options.reason = action.reason;
    action.days ? (options.days = action.days) : (options.days = 0);

    if (member) {
        member
            .ban(options)
            .then(member => {
                console.log("Banned member");
            })
            .catch(() => {
                console.log("ERROR: Failed to ban user. Invalid message format or lack of permissions.");
            });
    } else {
        console.log("ERROR: Member to be banned not found");
    }
};

module.exports.RoleReactionMenu_Handle = function (msg, client, action) {
    const Embed = new Discord.RichEmbed().setColor(action.color).setTitle(action.title).setDescription(action.description);

    action.roles.forEach(role => {
        const emo = client.emojis.find(emoji => emoji.name === role.emoji);
        if (emo) {
            Embed.addField(role.role, `${emo}`);
        } else {
            Embed.addField(role.role, role.emoji);
        }
    });

    const chan = msg.guild.channels.find(ch => ch.name === action.channelname);
    // Validate channel
    if (!chan && action.channelname != "") {
        console.log("ERROR: No channel found with name: " + action.channelname + ". Action name: " + action.name);
    } else if (action.channelname == "" && msg != "") {
        msg.channel.send(Embed).then(embedmsg => {
            action.roles.forEach(role => {
                embedmsg.react(getEmoji(client, role.emoji));
            });
            setCollector(embedmsg, action);
        });
    } else {
        chan.send(Embed).then(embedmsg => {
            action.roles.forEach(role => {
                embedmsg.react(getEmoji(client, role.emoji));
            });
            setCollector(embedmsg, action);
        });
    }
};

function setCollector(msg, action) {
    const filter = (reaction, user) => {
        return user.id !== msg.author.id;
    };
    const collector = msg.createReactionCollector(filter, {
        time: action.duration * 1000
    });

    collector.on("collect", (reaction, reactionCollector) => {
        var role = action.roles.find(rl => rl.emoji == reaction.emoji.name);
        if (role) {
            reaction.users.forEach(user => {
                if (!user.bot) {
                    var ReactedMember = msg.guild.members.find(mem => mem.user.id == user.id);
                    var RoleToGive = msg.guild.roles.find(rl => rl.name == role.role);
                    console.log(ReactedMember + " " + RoleToGive.name);
                    if (ReactedMember && RoleToGive) {
                        ReactedMember.addRole(RoleToGive);
                    } else {
                        console.log("ERROR: Could not find role or member to give");
                    }
                }
            });
        } else {
            console.log("ERROR: Role not found for this reaction");
        }
    });

    collector.on("end", collected => {
        console.log(`Collected ${collected.size} items`);
    });
}

function StoreValeinVariable_Handle(msg, client, action) {
    if (!cache[msg.guild.id]) cache[msg.guild.id] = {};
    let vars = cache[msg.guild.id];
    if (!vars.variables) vars.variables = [];
    let vararray = vars.variables;
    var paramValue;
    if (contains(vararray, "name", action.varname)) {
        // Update the value
        var existingvar = vararray.find(vari => vari.name == action.varname);
        if (action.type === "Get Command Author") {
            let found = msg.author;
            paramValue = found.id;
        } else if (action.type === "Get User Data") {
            let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);
            if (userCache[mem.id]) {
                paramValue = userCache[mem.id][action.field];
            }
        } else if (action.type === "Generate Random Number") {
            if (!isNaN(Number(action.min)) && !isNaN(Number(action.max))) {
                paramValue = Math.floor(Math.random() * (Number(action.max) - Number(action.min) + 1) + Number(action.min)).toString();
                action.vartype = "Number";
            }
        } else if (action.type === "Get Command Channel") {
            paramValue = msg.channel.name;
        } else if (action.vartype == "User") {
            let found = msg.mentions.members.first();
            paramValue = found.user.id;
        } else if (action.param == 0) {
            paramValue = msg.content.substr(msg.content.indexOf(" ") + 1);
        } else {
            paramValue = msg.content.split(" ")[action.param];
        }
        // If numeric then convert
        if (action.vartype == "number") {
            try {
                paramValue = Number(paramValue);
            } catch (err) {
                console.log("ERROR converting value: " + paramValue + " to number");
            }
        }
        existingvar.value = paramValue;
        existingvar.vartype = action.vartype;
    } else {
        // Write new value
        // Take whole string after the command
        if (action.type === "Get Command Author") {
            let found = msg.author;
            paramValue = found.id;
        } else if (action.type === "Get User Data") {
            let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);
            if (userCache[mem.id]) {
                paramValue = userCache[mem.id][action.field];
            }
        } else if (action.type === "Generate Random Number") {
            if (!isNaN(Number(action.min)) && !isNaN(Number(action.max))) {
                paramValue = Math.floor(Math.random() * (Number(action.max) - Number(action.min)) + Number(action.min)).toString();
                action.vartype = "Number";
            }
        } else if (action.type === "Get Command Channel") {
            paramValue = msg.channel.name;
        } else if (action.vartype == "User") {
            let found = msg.mentions.members.first();
            paramValue = found.user.id;
        } else if (action.param == 0) {
            paramValue = msg.content.substr(msg.content.indexOf(" ") + 1);
        } else {
            paramValue = msg.content.split(" ")[action.param];
        }

        // If numeric then convert
        if (action.vartype == "number") {
            try {
                paramValue = Number(paramValue);
            } catch (err) {
                console.log("ERROR converting value: " + paramValue + " to number");
            }
        }
        vararray.push({
            name: action.varname,
            value: paramValue,
            type: action.vartype
        });
    }
    vars.variables = vararray;
    cache[msg.guild.id] = vars;
    console.log(cache[msg.guild.id]);
}

module.exports.CreateChannel_Handle = function (msg, client, action) {
    var server = msg.guild;
    server.createChannel(action.channelname, action.channeltype.toLowerCase(), null, action.reason);
};

module.exports.DeleteChannel_Handle = function (msg, client, action) {
    var fetchedChannel = msg.guild.channels.find(r => r.name === action.channelname);
    if (fetchedChannel) {
        fetchedChannel.delete();
    }
};

module.exports.SetBotGame_Handle = function (msg, client, action) {
    client.user.setGame(action.game);
};

module.exports.SetStatus_Handle = function (msg, client, action) {
    client.user.setStatus(action.status.toLowerCase());
};

module.exports.SetAvatar_Handle = function (msg, client, action) {
    client.user.setAvatar(action.avatar);
};

module.exports.AddRoletoServer_Handle = function (msg, client, action) {
    let roleData = {};
    roleData.name = action.rolename;
    roleData.color = action.color;
    if (action.hoist == "true") roleData.hoist = true;
    if (action.mentionable == "true") roleData.mentionable = true;
    roleData.position = action.position;

    msg.guild.createRole(roleData);
};

module.exports.DeleteAllMessages_Handle = async function (msg, client, action) {
    const chan = msg.guild.channels.find(ch => ch.name === action.channelname);
    // Validate channel
    if (!chan && action.channelname != "") {
        console.log("ERROR: No channel found with name: " + action.channelname + ". Action name: " + action.name);
    } else {
        await chan
            .bulkDelete(action.msgcount)
            .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
            .catch(console.error);
    }
};

module.exports.SetUserData_Handle = function (msg, client, action) {
    let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);
    if (!userCache[mem.id]) {
        userCache[mem.id] = {};
    }
    let valToSet = null;
    if (!isNaN(action.fieldvalue)) {
        valToSet = Number(action.fieldvalue);
    } else {
        valToSet = action.fieldvalue;
    }
    userCache[mem.id][action.field] = valToSet;
};

module.exports.GetUserData_Handle = function (msg, client, action) {
    let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);
    if (userCache[mem.id]) {
    }
};

module.exports.CheckUserData = function (msg, client, action) {
    let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);
    var trueOrFalse = null;
    var valToCheck;
    if (userCache[mem.id]) {
        if (userCache[mem.id][action.field] !== null) {
            if (action.compare === "greater than") {
                if (!isNaN(action.value)) {
                    valToCheck = parseInt(action.value);
                    let currentVal = parseInt(userCache[mem.id][action.field]);
                    if (currentVal > valToCheck) {
                        trueOrFalse = true;
                    } else {
                        trueOrFalse = false;
                    }
                }
            }
            if (action.compare === "less than") {
                if (!isNaN(action.value)) {
                    valToCheck = parseInt(action.value);
                    let currentVal = parseInt(userCache[mem.id][action.field]);
                    if (currentVal < valToCheck) {
                        trueOrFalse = true;
                    } else {
                        trueOrFalse = false;
                    }
                }
            }
            if (action.compare === "equal to") {
                valToCheck = action.value;
                let currentVal = userCache[mem.id][action.field];
                if (currentVal == valToCheck) {
                    trueOrFalse = true;
                } else {
                    trueOrFalse = false;
                }
            }
            var passActions = {};

            if (trueOrFalse === true) {
                passActions.actions = action.trueActions;
                DBS.callNextAction(passActions, msg, msg.args, 0);
                //passActions.actions = action.trueActions
            } else {
                passActions.actions = action.falseActions;
                DBS.callNextAction(passActions, msg, msg.args, 0);
            }
        }
    }
};

function EditUserData(msg, client, action) {
    let mem = msg.guild.members.find(gm => gm.user.tag == action.user || gm.user.id == action.user);

    if (!userCache[mem.id]) {
        userCache[mem.id] = {};
        userCache[mem.id][action.field] = 0;
    }
    if (!userCache[mem.id][action.field]) {
        userCache[mem.id][action.field] = 0;
    }
    //console.log(action);
    if (userCache[mem.id]) {
        if (userCache[mem.id][action.field] !== null) {
            let valToSet = null;
            if (!isNaN(action.value)) {
                valToSet = parseInt(action.value);
                let currentval = parseInt(userCache[mem.id][action.field]);
                console.log("value");
                console.log(valToSet);
                if (action.oper === "+") {
                    userCache[mem.id][action.field] = currentval + valToSet;
                } else if (action.oper === "-") {
                    userCache[mem.id][action.field] -= valToSet;
                } else if (action.oper === "x") {
                    userCache[mem.id][action.field] *= valToSet;
                } else if (action.oper === "/") {
                    userCache[mem.id][action.field] /= valToSet;
                }
            }
        } else {
            console.log("field doesnt exist");
        }
    }
}

module.exports.GetRow_Handle = function (msg, client, action) {
    var parentContext = this;
    var passActions = {};
    var objectToAdd = {};
    const csvFile = fs.readFileSync(path.resolve(__dirname, "../BotData/sheets/" + action.selectedsheet));
    const csvData = csvFile.toString();
    Papa.parse(csvData, {
        header: true,
        complete: function (results, file) {
            //console.log(results.data);
            var foundValue = results.data.filter(obj => obj[action.colheader] === action.colval);
            if (foundValue.length > 0) {
                objectToAdd[action.rowvariable] = foundValue[0];
                if (!cache[msg.guild.id]) cache[msg.guild.id] = {};
                let vars = cache[msg.guild.id];
                if (!vars.variables) vars.variables = [];
                let vararray = vars.variables;
                if (contains(vararray, "name", action.rowvariable)) {
                    var existingvar = vararray.find(vari => vari.name == action.rowvariable);
                    existingvar.value = foundValue[0];
                    existingvar.type = "row";
                } else {
                    console.log(objectToAdd[action.rowvariable]);
                    vararray.push({
                        name: action.rowvariable,
                        value: foundValue[0],
                        type: "row"
                    });
                }
                vars.variables = vararray;
                cache[msg.guild.id] = vars;
                passActions.actions = action.trueActions;
                DBS.callNextAction(passActions, msg, msg.args, 0);
            } else {
                //breakFailure = false;
                passActions.actions = action.falseActions;
                DBS.callNextAction(passActions, msg, msg.args, 0);
            }
        }
    });
};

module.exports.EditVariable_Handle = function (msg, client, action) {
    if (!isNaN(Number(action.value))) {
        if (cache[msg.guild.id]) {
            let vars = cache[msg.guild.id];
            if (vars.variables) {
                let vararray = vars.variables;
                if (contains(vararray, "name", action.varname)) {
                    var existingvar = vararray.find(vari => vari.name == action.varname);
                    if (!isNaN(Number(existingvar.value))) {
                        var returnValue = 0;
                        var existingValue = Number(existingvar.value);
                        var numberToEdit = Number(action.value);
                        if (action.oper == "+") {
                            returnValue = existingValue + numberToEdit;
                        } else if (action.oper == "-") {
                            returnValue = existingValue - numberToEdit;
                        } else if (action.oper == "x") {
                            returnValue = existingValue * numberToEdit;
                        } else {
                            returnValue = existingValue / numberToEdit;
                        }
                        existingvar.value = returnValue;
                        vars.variables = vararray;
                        cache[msg.guild.id] = vars;
                    }
                }
            }
        }
    }
};

module.exports.CheckVariableValue_Handle = function (msg, client, action) {
    var trueOrFalse = null;
    if (cache[msg.guild.id]) {
        let vars = cache[msg.guild.id];
        if (vars.variables) {
            let vararray = vars.variables;
            if (contains(vararray, "name", action.varname)) {
                var existingvar = vararray.find(vari => vari.name == action.varname);
                if (action.compare === "greater than") {
                    if (!isNaN(action.value)) {
                        valToCheck = parseInt(action.value);
                        let currentVal = existingvar.value;
                        if (currentVal > valToCheck) {
                            trueOrFalse = true;
                        } else {
                            trueOrFalse = false;
                        }
                    }
                }
                if (action.compare === "greater than") {
                    if (!isNaN(action.value)) {
                        valToCheck = parseInt(action.value);
                        let currentVal = existingvar.value;
                        if (currentVal < valToCheck) {
                            trueOrFalse = true;
                        } else {
                            trueOrFalse = false;
                        }
                    }
                }
                if (action.compare === "equal to") {
                    valToCheck = action.value;
                    let currentVal = existingvar.value;
                    if (currentVal == valToCheck) {
                        trueOrFalse = true;
                    } else {
                        trueOrFalse = false;
                    }
                }

                var passActions = {};

                if (trueOrFalse === true) {
                    passActions.actions = action.trueActions;
                    DBS.callNextAction(passActions, msg, msg.args, 0);
                } else {
                    passActions.actions = action.falseActions;
                    DBS.callNextAction(passActions, msg, msg.args, 0);
                }
            }
        }
    }
};

module.exports.CheckUserPermissions_Handle = function (msg, client, action) {
    var mem = GetUserByTagOrId(msg.guild, action.user);
    var hasPerms;
    if (mem) {
        var passActions = {};
        if (action.permissions.length === 0) {
            hasPerms = true;
        } else {
            if (mem.hasPermission(action.permissions)) {
                hasPerms = true;
            } else {
                hasPerms = false;
            }
        }
        if (hasPerms) {
            passActions.actions = action.trueActions;
            DBS.callNextAction(passActions, msg, msg.args, 0);
        } else {
            passActions.actions = action.falseActions;
            DBS.callNextAction(passActions, msg, msg.args, 0);
        }
    } else {
        console.log("Member not found with tag/id: " + action.user);
    }
};

function GetUserByTagOrId(guild, tagorid) {
    var mem = guild.members.find(gm => gm.user.tag == tagorid || gm.user.id == tagorid);
    return mem;
}

function getEmoji(client, emojifield) {
    const emo = client.emojis.find(emoji => emoji.name === emojifield);
    if (emo) {
        return `${emo.id}`;
    } else {
        return emojifield;
    }
}

function contains(arr, key, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) return true;
    }
    return false;
}
