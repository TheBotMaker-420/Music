const Discord = require("discord.js");
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Player } = require("discord-player");

dotenv.config();
const Token = process.env.Token;

const LOAD_SLASH = process.argv[2] == "load";

const client_id = "991297107766030389";
const guild_id = "991296633914527804";

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_VOICE_STATES"
    ]
});

client.slashcommands = new Discord.Collection();
client.player = new Player(client, {
    ytdlOptions : {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

let commands = [];

const slashfiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"));
for (const file of slashfiles){
    const slashcmd = require(`./slash/${file}`);
    client.slashcommands.set(slashcmd.data.name, slashcmd);
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
    const rest = new REST({version:"9"}).setToken(Token);
    console.log("Deploying");
    rest.push(Routes.applicationGuildCommands(client_id,guild_id), {body: commands})
    .then(() => {
        console.log("Loaded");
        process.exit(0);
    }).catch((err) => {
        console.log(err);
        process.exit(1);
    })
}
else {
    client.on("ready",() => {
        console.log(`Logged In As ${client.user.tag}`);
    })
    client.on("interactionCreate",(interaction) => {
        async function handleCommand() {
            if(!interaction.isCommand) return;

            const slashcmd = client.slashcommands.get(interaction.commandName);
            if (!slashcmd) {
                interaction.reply("Not Valid");
            }
            await interaction.deferReply();
            await slashcmd.run({ client, interaction });
        }
        handleCommand();
    })
    client.login(Token);
}