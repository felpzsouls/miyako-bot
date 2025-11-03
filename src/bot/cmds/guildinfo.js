const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guildinfo')
    .setDescription('Mostra informações sobre o servidor.'),
    category: 'Informações',
    aliases: ['serverinfo', 'infoservidor'],
  run: async (bot, interaction, args) => {
    let isSlash = !!interaction.options;
    let user = isSlash ? interaction.user : interaction.author;

    const guild = isSlash ? interaction.guild : interaction.guild;
    const owner = await guild.fetchOwner();
    const memberCount = guild.memberCount;
    // createdAt como 01 de janeiro de 2020
    const createdAt = guild.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    // calculo de tempo desde a criação
    const createdAtTimestamp = Math.floor(guild.createdAt.getTime() / 1000);
    const joinedAt = guild.joinedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const channels = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;

    const embed = new EmbedBuilder()
        .setTitle(`Informações do Servidor: ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
            { name: 'ID do Servidor', value: `${guild.id}`, inline: true },
            { name: 'Proprietário', value: `${owner.user.tag}`, inline: true },
            { name: `Membros`, value: `${memberCount}`, inline: true },
            { name: `Canais (${channels})`, value: `Texto: ${textChannels}, Voz: ${voiceChannels}`, inline: true },
            { name: 'Criado em:', value: `${createdAt} (<t:${createdAtTimestamp}:R>)`, inline: true },
            { name: 'Entrei aqui em:', value: `${joinedAt} (<t:${Math.floor(guild.joinedAt.getTime() / 1000)}:R>)`, inline: true }
        )
        .setColor('Random')
        .setFooter({ text: `Solicitado por ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};