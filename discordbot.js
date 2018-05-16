const Discord = require('discord.js');
const client = new Discord.Client();

const Phone = require('./obj/caller.js');
const Call = require('./obj/call.js');

var phones = [];
var calls = [];

function GetGuild(guildid,callback) {
  console.log("Finding guild: " + guildid);
  var found = false;
  client.guilds.forEach(guild => {
    if (found) {
      return;
    }
    if (guild.id == guildid) {
      found = true;
      console.log("Found Guild: " + guild.name + " (guildid)");
      callback(guild);
    }
  });
}

function GetChannel(guild, channelid, callback) {
  var found = false;
  guild.channels.forEach(channel => {
    if (found) {
      return;
    }
    if (channel.id == channelid) {
      found = true;
      console.log("Found Channel: " + guild.name + "#" + channel.name + " (guildid)");
      callback(channel);
    }
  });
}

function GetPhoneFromID(phoneid, callback) {
  var found = false;
  phones.forEach(phone => {
    if (found) {
      return;
    }
    if (phoneid==phone.id) {
      found = true;
      callback(phone);
    }
  });
}

function GetPhone(guild, channel, callback) {
  var found = false;
  phones.forEach(phone => {
    if (found) {
      return;
    }
    if (phone.guild==guild.id && phone.channel==channel.id) {
      found = true;
      callback(phone);
    }
  });
  if (!found) {
    var id = phones.length;
    var phone = new Phone(id, guild.id, channel.id, guild.name + "#" + channel.name)
    phones.push(phone);
    callback(phone);
  }
}

function GetCall(phone, callback) {
  var found = false;
  calls.forEach(call => {
    if (phone.inCall) {
      if (found) {
        return;
      }
      if (call.members.includes(phone)) {
        found = true;
        callback(call);
        return;
      }
    }
    if (call.members.length == 1&& !call.members.includes(phone)) {
      call.join(phone);
      found = true
      callback(call);
      return;
    }
  });
  if (!found) {
    var id = calls.length;
    var call = new Call(id,phone);
    calls.push(call);
    callback(call);
    return;
  }
}

function GetCallID(phone,id, callback) {
  var found = false;
  calls.forEach(call => {
    if (call.id != id) {
      return;
    }
    if (!call.members.includes(phone)) {
      call.join(phone);
      found = true
      callback(call);
      return;
    }
  });
  if (!found) {
    var call = new Call(id,phone);
    calls.push(call);
    callback(call);
    return;
  }
}

function GetOtherEnd(sender, call, callback) {
  call.members.forEach(member => {
    if (member != sender) {
      callback(member);
    }
  });
}

function SendText(sender, call, text) {
  call.members.forEach(member => {
    if (member != sender) {
      GetGuild(member.guild, guild =>{
        GetChannel(guild, member.channel, channel => {
          console.log("Sending \"" + text + "\"  from " + sender.name + " to " + member.name + " via " + call.getName());
          channel.send(text);
        });
      });
    }
  });
}

function SendMessage(sender, call, message) {
  call.members.forEach(member => {
    if (member != sender) {
      GetGuild(member.guild, guild =>{
        GetChannel(guild, member.channel, channel => {
          console.log("Sending \"" + message.content + "\" from " + sender.name + " to " + member.name + " via " + call.getName());
          channel.send("**" + message.member.user.tag + "**: " +  message.content);
        });
      });
    }
  });
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ game: { name: 'Type =help for commands' }, status: 'online' })
});

client.on('message', message => {
  if (message.guild == undefined) {
    return;
  }
  if (message.member == message.guild.me) {
    return;
  }

  //Detect if in a call
    //detect if user asked to hang up
      //hang up
    //if the user did not hang up
      //send message to other channel
  //if not in a call
    //detect if user asked to call
    if (message.content == "=help") {
      message.reply("**Commands**\n```\n=call - Make a call\n=call [id] - Join a specific call\n=calls - See Active Calls\n=hangup - Dissconect from current call\n=invite - put this phone on your own server\n=members - see members of this call\n```")
      return;
    }
  if (message.content == "=invite") {
    message.reply("Use this link to add me on your server: https://discordapp.com/api/oauth2/authorize?client_id=446367231740215317&permissions=514112&scope=bot")
    return;
  }
  if (message.content == "=calls") {
    calls.forEach(call => {
      message.channel.send(call.getName())
    })
    return;
  }
  if (message.content == "=phones") {
    phones.forEach(phone => {
      message.channel.send(phone.name);
    })
    return;
  }
  GetPhone(message.guild,message.channel,phone => {
    if (phone.inCall) {
      GetCall(phone, call => {
          if (message.content == "=members") {
            call.members.forEach(member =>{
              message.channel.send(member.name);
            });
            return;
          }
          if (message.content == "=hangup") {
            SendText(phone, call, phone.name + " Disconected");
            SendText(phone, call, "How ever you are still in a call and will need to `!hangup` to leave.");
            call.leave(phone);
            message.channel.send("Disconected");
            return;
          }
        SendMessage(phone, call, message);
      })
    } else {
      if (message.content.startsWith("=call ")) {
        var id = message.content.replace("=call ","");
        message.channel.send("Phone Name: " + phone.name);
        GetCallID(phone, id, call => {
          message.channel.send("Joined " + call.getName() + " id:`" + call.id + "`");
          if (call.members.length == 1) {
            message.channel.send("Waiting for Answer")
          } else {
            SendText(phone, call, phone.name + "Joined the call");
            SendText(phone, call, "Use `=hangup` to leave");
            GetOtherEnd(phone, call, otherEnd => {
              message.channel.send("Connected to " + otherEnd.name);
              message.channel.send("Use `=hangup` to leave");
            });
          }
          return;
        });
      }
      if (message.content == "=call") {
        message.channel.send("Phone Name: " + phone.name);
        GetCall(phone, call => {
          message.channel.send("Joined " + call.getName() + " id:`" + call.id + "`");
          if (call.members.length == 1) {
            message.channel.send("Waiting for Answer")
          } else {
            SendText(phone, call, phone.name + "Joined the call");
            SendText(phone, call, "Use `=hangup` to leave");
            GetOtherEnd(phone, call, otherEnd => {
              message.channel.send("Connected to " + otherEnd.name);
              message.channel.send("Use `=hangup` to leave");
            });
          }
        });
      }
    }

  });


});

module.exports = client;
