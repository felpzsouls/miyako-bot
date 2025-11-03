const moongoose = require('mongoose');
const Schema = new moongoose.Schema({
    id: { type: String, required: true },
    whiskers: { type: Number, default: 0 },
    lastDaily: { type: Date, default: null }
});

const user = moongoose.model('user', Schema);
module.exports = user;