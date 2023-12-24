// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

//goes to ClownBot\commands
const foldersPath = path.join(__dirname, 'commands');
//reads contents of commands
const commandFolders = fs.readdirSync(foldersPath);

//for every folder in commands folder
for (const folder of commandFolders) {
    //navigate inside it (ClownBot\commands\utility)
	const commandsPath = path.join(foldersPath, folder);
    //reads contents of folder thats a js file
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    //for every js file in the current folder
	for (const file of commandFiles) {
        //navigate to each js file
		const filePath = path.join(commandsPath, file);
		//console.log(filePath)
		const command = require(filePath);
		//console.log(command)
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(token)