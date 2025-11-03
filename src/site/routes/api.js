const { Router } = require('express');
const route = Router();
const guildSchema = require('../../models/guild');
const { bot } = require('../../bot/index');

route.post('/update-guild-data', async (req, res) => {
  const { guildId, prefix, restricted, messageRestr, blockedChannels, welcome, goodbye, autorole } = req.body;

  try {
    let guild = await guildSchema.findOne({ id: guildId });
    if (!guild) {
      guild = new guildSchema({
        id: guildId
      });
    }


    await guildSchema.updateOne(
      { 'id': guildId },
      {
        $set: {
          prefix,
          'restricted.active': restricted,
          'restricted.channels': blockedChannels,
          'restricted.message': messageRestr,
          'welcome.active': welcome?.active,
          'welcome.channel': welcome?.channel,
          'welcome.message': welcome?.message,
          'goodbye.active': goodbye?.active,
          'goodbye.channel': goodbye?.channel,
          'goodbye.message': goodbye?.message,
          'autorole.active': autorole?.active,
          'autorole.roleId': autorole?.roleId
        }
      },
      { upsert: true }
    );
    res.json({ message: 'Dados da guild atualizados com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar os dados da guild:', error);
    res.status(500).json({ message: 'Erro ao atualizar os dados da guild.', error: error.message });
  }
});

module.exports = route;