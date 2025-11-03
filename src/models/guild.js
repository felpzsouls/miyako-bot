const mongoose = require(`mongoose`),
    Schema = new mongoose.Schema({
        id: { type: Number, required: true },
        prefix: { type: String, default: `-`},
        restricted: {
            active: {type: Boolean, default: false},
            channels: {type: [String], default: []},
            message : { type: String, default: 'Você não pode usar comandos nesse canal!' }
        },
        welcome: {
            active: { type: Boolean, default: false },
            channel: { type: String, default: null },
            message: { type: String, default: 'Seja bem-vindo(a), {user}!' }
        },
        goodbye: {
            active: { type: Boolean, default: false },
            channel: { type: String, default: null },
            message: { type: String, default: 'Adeus, {user}!' }
        },
        autorole: {
            active: { type: Boolean, default: false },
            roleId: { type: String, default: null }
        }
    });

guild = mongoose.model('guild', Schema);

module.exports = guild;