const data = require("../../models/guild");

module.exports = {
    getGuildData: async function (guildId) {
        const guild = await data.findOne({ id: guildId });

        if (!guild) {
            const newGuild = new data({
                id: guildId,
                prefix: "-",
            })

            newGuild.save();
        };
    }
}