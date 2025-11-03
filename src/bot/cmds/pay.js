const { SlashCommandBuilder } = require('discord.js');
const userModel = require('../../models/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pague Whiskers para outro usuário!')
    .addUserOption(option => option.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption(option => option.setName('quantia').setDescription('Quantia').setRequired(true)),
    category: 'Economia',
    aliases: ['pagar', 'transferir'],
  run: async (bot, interaction, args) => {
    const isSlash = !!interaction.options;
    const invokerId = isSlash ? interaction.user.id : interaction.author.id;

    // resolve target user
    let targetUser = null;
    let targetId = null;
    if (isSlash) {
      targetUser = interaction.options.getUser('usuario');
      targetId = targetUser.id;
    } else {
      if (args && args[0]) {
        const mention = args[0];
        const matches = mention.match(/^<@!?(\d+)>$/);
        targetId = matches ? matches[1] : mention;
        try { targetUser = await bot.users.fetch(targetId); } catch (e) { console.error(e); }
      }
    }

    // amount
    let amount = 0;
    if (isSlash) amount = interaction.options.getInteger('quantia');
    else if (args && args[1]) amount = parseInt(args[1], 10);

    // validações
    if (!targetUser) return isSlash ? interaction.reply({ content: '❌ Usuário inválido.', ephemeral: true }) : interaction.channel.send('❌ Usuário inválido.');
    if (targetUser.bot) return isSlash ? interaction.reply({ content: '🤖 Você não pode pagar bots.', ephemeral: true }) : interaction.channel.send('🤖 Você não pode pagar bots.');
    if (targetId === invokerId) return isSlash ? interaction.reply({ content: '❌ Você não pode pagar a si mesmo.', ephemeral: true }) : interaction.channel.send('❌ Você não pode pagar a si mesmo.');
    if (isNaN(amount) || amount <= 0) return isSlash ? interaction.reply({ content: '❌ Quantia inválida.', ephemeral: true }) : interaction.channel.send('❌ Quantia inválida.');

    // dados do pagador
    let payerData = await userModel.findOne({ id: invokerId });
    if (!payerData) {
      payerData = new userModel({ id: invokerId, whiskers: 0 });
      await payerData.save();
    }
    if (payerData.whiskers < amount) return isSlash ? interaction.reply({ content: '❌ Saldo insuficiente.', ephemeral: true }) : interaction.channel.send('❌ Saldo insuficiente.');

    // dados do destinatário
    let targetData = await userModel.findOne({ id: targetId });
    if (!targetData) {
      targetData = new userModel({ id: targetId, whiskers: 0 });
      await targetData.save();
    }

    // enviar confirmação NO CANAL (não ephemerally)
    if (isSlash) await interaction.reply({ content: '⏳ Confirmação enviada no canal.', ephemeral: true });
    const confirmMessage = `💸 ${isSlash ? interaction.user.username : interaction.author.username}, confirmar pagamento de **${amount} Whiskers** para **${targetUser.username}**? Reaja com ✅ para confirmar.`;
    const sentMessage = await (isSlash ? interaction.channel.send(confirmMessage) : interaction.channel.send(confirmMessage));

    // tenta reagir e loga erro se houver
    try {
      await sentMessage.react('✅');
    } catch (err) {
      console.error('Erro ao reagir:', err);
      return sentMessage.edit('❌ Não consegui adicionar reação. Verifique permissões do bot (Add Reactions, Read Message History).');
    }

    const filter = (reaction, user) => {
      // se reaction for parcial, vamos buscar dentro do collect
      return reaction.emoji.name === '✅' && user.id === invokerId;
    };

    const collector = sentMessage.createReactionCollector({ filter, max: 1, time: 15000 });

    collector.on('collect', async (reaction, user) => {
      try {
        // lidar com partial reaction
        if (reaction.partial) await reaction.fetch();
        if (user.partial) await user.fetch();

        // atualização dos saldos
        payerData.whiskers -= amount;
        targetData.whiskers += amount;
        await payerData.save();
        await targetData.save();

        const successMessage = `✅ Transferência concluída! Você pagou **${amount} Whiskers** para **${targetUser.username}**.`;
        if (isSlash) await interaction.followUp({ content: successMessage, ephemeral: true });
        await sentMessage.edit(successMessage);
      } catch (err) {
        console.error('Erro ao processar transferência:', err);
        await sentMessage.edit('❌ Ocorreu um erro ao processar a transferência.');
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutMessage = `⌛ Tempo esgotado. Transferência cancelada.`;
        if (isSlash) await interaction.followUp({ content: timeoutMessage, ephemeral: true });
        await sentMessage.edit(timeoutMessage);
      }
    });
  }
};
