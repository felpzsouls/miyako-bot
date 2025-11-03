const { Router } = require(`express`),
  route = Router(),
  passport = require(`passport`),
  bot = require('../../bot/index').bot;

route.get(`/discord`, passport.authenticate('discord'));
route.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), async (req, res) => {
    res.cookie(`token`, req.user)
    res.redirect('/dashboard')
})

module.exports = route;