const { Router } = require('express');
const router = Router();
const bot = require('../../bot').bot;

router.get('/', (req, res) => {
  res.redirect(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot%20applications.commands`);
});

module.exports = router;