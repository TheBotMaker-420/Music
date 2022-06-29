const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops The Music And Clears The Queue"),
    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue) return await interaction.editReply("There are no songs in the queue")

        queue.destroy()
        await interaction.editReply("Leaving The Voice Channel !!")
    },
}