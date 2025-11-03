const { SlashCommandBuilder }= require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("bana um membro do servidor")
        .addUserOption(option =>
            option.setName("membro")
                .setDescription("membro a ser banido")
                .setRequired(true) 
        )
        .addNumberOption(option =>
            option.setName("tempo")
                .setDescription("tempo de banimento em dias (opcional)")
                .setRequired(false)
        ),
    category: "Moderação",
    usage: "<membro> [tempo]",
    aliases: ["banir"],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;

        // normaliza executor e função de reply para Slash vs Message
        const executorUser = isSlash ? interaction.user : interaction.author;
        const executorMember = isSlash ? interaction.member : interaction.member; // message.member também existe
        const reply = async (payload) => {
            try {
                if (isSlash) return interaction.reply(payload);
                // em mensagem, prefira message.reply se existir
                if (typeof payload === "object") {
                    const text = payload.content ?? JSON.stringify(payload);
                    return interaction.reply ? interaction.reply(text) : interaction.channel.send(text);
                } else {
                    return interaction.reply ? interaction.reply(payload) : interaction.channel.send(payload);
                }
            } catch (e) {
                // fallback
                if (!isSlash) interaction.channel.send(typeof payload === "string" ? payload : (payload.content ?? ""))
                    .catch(() => null);
            }
        };

        // resolve usuário alvo
        let user = isSlash ? interaction.options.getUser("membro") : (args && args[0]);
        if (!isSlash && args && args[0]) {
            // tenta resolver menção ou ID
            const mention = args[0];
            const matches = mention.match(/^<@!?(\d+)>$/);
            if (matches) {
                const userId = matches[1];
                user = interaction.guild.members.cache.get(userId)?.user;
            } else {
                user = interaction.guild.members.cache.get(mention)?.user;
                if (!user) {
                    return await reply({ content: `❌ | Membro \`${mention}\` não encontrado.`, ephemeral: true });
                }
            }
        }

        const tempo = isSlash ? interaction.options.getNumber("tempo") : (args && args[1] ? parseInt(args[1]) : null);

        if (!user) {
            return await reply({ content: `Por favor, mencione um membro válido para banir.`, ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return await reply({ content: `O usuário mencionado não é um membro deste servidor.`, ephemeral: true });
        }
        if (!member.bannable) {
            return await reply({ content: `Não posso banir este membro. Verifique minhas permissões e a hierarquia de cargos.`, ephemeral: true });
        }

        try {
            const msg = { content: `✅ | Membro \`${user.tag}\` banido com sucesso!`, ephemeral: true };
            if (tempo) {
                await member.ban({ reason: `Banido por ${executorUser.tag}`, days: tempo });
                msg.content += `\n⏳ | O banimento terá duração de ${tempo} dias.`;
            } else {
                await member.ban({ reason: `Banido por ${executorUser.tag}` });
            }
            return await reply(msg);
        } catch (error) {
            console.error("Erro ao banir o membro:", error);
            return await reply({ content: `❌ | Houve um erro ao tentar banir o membro. Por favor, tente novamente mais tarde.`, ephemeral: true });
        }
    }
};