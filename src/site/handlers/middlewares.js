const express = require(`express`),
    session = require(`express-session`),
    passport = require(`passport`),
    discordStrategy = require(`passport-discord`).Strategy,
    cookieParser = require("cookie-parser");

module.exports = async (app) => {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    app.set(`view engine`, `pug`);
    app.set(`views`, __dirname.replace('\\handlers', '\\dynamic'));

    app.use(express.static(__dirname.replace('\\handlers', `\\dynamic\\static`)));
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false
    }));

    passport.use(new discordStrategy({
        clientID: process.env.id,
        clientSecret: process.env.secret,
        scope: ['identify', 'guilds'],
        callbackURL: 'http://localhost/auth/discord/callback'
    }, async (acessToken, refreshToken, profile, cb) => {
        return cb("", profile)
    }))
    
    app.use(passport.initialize());
    app.use(passport.session());
};