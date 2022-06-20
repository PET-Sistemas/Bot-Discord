const fs = require('node:fs');

// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//Requiring system variables
require('dotenv').config();

//discord token to acess bot
const token = process.env.DISCORD_TOKEN;

// Login to Discord with your bot token
client.login(token);

//Requiring to update commands
const refreshCommands = require('./deploy-commands');
refreshCommands();

//Creating a new Collection of commands
client.commands = new Collection();

//Read all commands files from 'commands' folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//Create a 'client.command' dynamically 
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

//Create Listener for execute dynamically commands
client.on('interactionCreate', async interaction => {
	//verify if interaction doesn't a command
	if (!interaction.isCommand()) return;

	//store the command name
	const command = client.commands.get(interaction.commandName);

	//verify if command exist
	if (!command) return;

	//When "/semanaltasks" is called, grab the cache channel and export
	if(interaction.commandName === "semanaltasks"){
		await getCacheChannel();
	}

	try {
		//execute the command according files .js in folder commands
		await command.execute(interaction);
	} catch (error) {
		//print error recieved
		console.error(error);
		//response for bot that was an error when try to execute the command passed
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


//Grab cache channel, append messages to an array and export that
async function getCacheChannel() {
	//Create cache for channel "atualizacao-semanal" with id of this channel
	const channel = await client.channels.cache.get("958801848091934750");

	//Array that recieve messages objects
	const Messages = [];

	//Read 30 messages in the channel
	await channel.messages.fetch({ limit: 30 }).then(async (messages) => {
		//filter data for each message recieved
		messages.forEach( async(message) => {
			//verify if message doesn't send by a bot
			if(!message.author.bot){
				//get a author of the message
				let author = await getAuthorDisplayName(message);
				//Create an object for each message and add to array Messages
				Messages.push(new Msg(author, message.content, message.createdTimestamp));
			}			
		});
	});

	//export data from read messages
	module.exports = Messages;
}

//returns the name of the author of the message prioritizing your nickname
const getAuthorDisplayName = async (msg) => {
	//take datas of the author of the message in your guild
	const member = await msg.guild.members.fetch(msg.author);
	//verify if author exist in your guild and get your nickname else get your own name 
	return member ? member.nickname : msg.author.username;
  }

//Class that will be used to organize messages readeds
class Msg {
	constructor(usr, content, data){
        this.usr = usr;
		this.content = content;
        this.data = data; 
    }
}
