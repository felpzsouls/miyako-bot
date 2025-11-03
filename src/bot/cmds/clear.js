const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("limpa mensagens em um canal de texto")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName("quantidade")
                .setDescription("quantidade de mensagens a serem apagadas (max 100)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100),
        ),
    category: "Moderação",
    usage: "<quantidade>",
    aliases: ["limpar", "purge", "apagar"],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;
        const amountRaw = isSlash ? interaction.options.getInteger("quantidade") : (args && args[0]);
        const amount = Number.parseInt(amountRaw, 10);

        if (!amount || Number.isNaN(amount) || amount < 1 || amount > 100) {
            const msg = { content: `Por favor, forneça uma quantidade válida de mensagens para apagar (entre 1 e 100).`, ephemeral: true };
            if (isSlash) return interaction.reply(msg);
            return interaction.reply ? interaction.reply(msg.content) : null;
        }

        const channel = interaction.channel;
        const me = interaction.guild.members.me ?? interaction.guild.members.cache.get(bot.user.id);
        const member = interaction.member;

        // Verifica permissão do bot no canal (considera overwrites)
        if (!channel.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages)) {
            const text = `Eu não tenho permissão para gerenciar mensagens neste canal. Por favor, verifique minhas permissões e tente novamente.`;
            if (isSlash) return interaction.reply({ content: text, ephemeral: true });
            return interaction.reply ? interaction.reply(text) : null;
        }

        // Verifica permissão do membro
        if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const text = `Você não tem permissão para gerenciar mensagens neste servidor.`;
            if (isSlash) return interaction.reply({ content: text, ephemeral: true });
            return interaction.reply ? interaction.reply(text) : null;
        }

        try {
            if (isSlash) await interaction.deferReply({ ephemeral: true });

            // bulkDelete ignora mensagens com mais de 14 dias automaticamente quando second param = true
            const deleted = await channel.bulkDelete(amount, true);
            const deletedCount = deleted?.size ?? 0;

            if (isSlash) {
                await interaction.editReply({ content: `🧹 | ${deletedCount} mensagens apagadas com sucesso!` });
            } else {
                // usar channel.send para evitar referência a mensagem que pode ter sido deletada
                await channel.send(`🧹 | ${deletedCount} mensagens apagadas com sucesso!`).catch(() => null);
            }
        } catch (error) {
            console.error("Erro ao apagar mensagens:", error);
            const text = `Houve um erro ao tentar apagar as mensagens. Por favor, verifique minhas permissões e tente novamente.`;
            try {
                if (isSlash) await interaction.editReply({ content: text });
                else
                    await channel.send(text).catch(() => null);
            } catch {
                // fallback silencioso
            }
        }
    }
}