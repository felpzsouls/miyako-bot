const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription(`Mostra a lista de todos os meus comandos`)
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('O comando que você deseja ver detalhes')
        ),
    category: 'Utilitários',
    aliases: ['commands', 'comandos'],
    run: async(bot, int, args) => {

        const isSlash = !!int.options;
        const commandName = isSlash ? int.options.getString('comando') : (args && args[0]);
        
        if (commandName) {
            // mostra detalhes de um comando específico
            const cmd = bot.cmds.get(commandName) || bot.aliases.get(commandName);
            if (!cmd) {
                return await int.reply({ content: `❌ | Comando \`${commandName}\` não encontrado.` });
            }
            const embed = new EmbedBuilder()
                .setTitle(`Comando: ${cmd.data.name}`)
                .setColor('Green')
                .setTimestamp();

            if (cmd.data.description) {
                embed.addFields({ name: 'Descrição', value: cmd.data.description, inline: false });
            }
            if (cmd.usage) {
                embed.addFields({ name: 'Uso', value: `\`${cmd.data.name} ${cmd.usage}\``, inline: false });
            }
            if (cmd.aliases && cmd.aliases.length > 0) {
                embed.addFields({ name: 'Aliases', value: cmd.aliases.map(a => `\`${a}\``).join(', '), inline: false });
            }
            return await int.reply({ embeds: [embed] });
        }
        // cria uma embed com a lista de comandos do bot, organizados por categoria
        const categories = {};
        bot.cmds.forEach(cmd => {
            const category = cmd.category || 'Sem categoria';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(cmd.data.name);
        });

        const embed = new EmbedBuilder()
            .setTitle('Lista de Comandos 📜')
            .setColor('Green')
            .setTimestamp()
            .setDescription('para ver como usar um comando, digite `/help <comando>`')
            .setFooter({ text: `Total de comandos: ${bot.cmds.size} \`<> <- são obrigatorios e [] <- opcionais \`` });
        for (const [category, commands] of Object.entries(categories)) {
            embed.addFields({ name: category, value: commands.map(cmd => `\`${cmd}\``).join(', '), inline: false });
        }
        await int.reply({ embeds: [embed] });
    }
}