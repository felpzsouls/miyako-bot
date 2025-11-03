const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("tranca e destranca um canal de texto para que ninguem possa enviar mensagens")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    category: "Moderação",
    aliases: ["trancar", "unlock", "destrancar"],
    run: async (bot, interaction) => {
        const channel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        // Verifica se o bot tem permissão para gerenciar canais

        if(interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels) === false) {
            return interaction.reply({ content: `Eu não tenho permissão para gerenciar canais neste servidor. Por favor, verifique minhas permissões e tente novamente.`, ephemeral: true });
        }
        
        // Verifica se o membro que executou o comando tem permissão para gerenciar canais

        if(interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) === false) {
            return interaction.reply({ content: `Você não tem permissão para gerenciar canais neste servidor.`, ephemeral: true });
        }

        try {
            // tranca o canal, mas se ja estiver trancado o destranca
            const currentPermission = channel.permissionsFor(everyoneRole).has(PermissionFlagsBits.SendMessages);
            if (currentPermission) {
                await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: false });
                await interaction.reply({ content: `Canal trancado com sucesso! `, ephemeral: true });
            } else {
                await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: null });
                await interaction.reply({ content: `Canal destrancado com sucesso!`, ephemeral: true });
            }
            
        } catch (error) {
            console.error("Erro ao trancar o canal:", error);
            await interaction.reply({ content: `Houve um erro ao tentar trancar o canal. Por favor, verifique minhas permissões e tente novamente.`, ephemeral: true });
        }
    }
}