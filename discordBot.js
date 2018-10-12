const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');

const Data = require('./obj/data.js');

const client = new Commando.Client({
  commandPrefix: '=t',
  owner:'336869008148135948',
  disableEveryone: true
});

client.registry
    // Registers your custom command groups
    .registerGroups([
        ['phone', 'Phone Commands'],
    ])
    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', ()=> {
  console.log(`Logged in as ${client.user.tag}`);
  client.data = new Data();
  client.user.setActivity('Calls',{type:"LISTENING"});
});

/*client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});*/

module.exports = client;
