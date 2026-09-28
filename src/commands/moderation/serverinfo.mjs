export default {
    name: 'serverinfo',
    async execute(msg, args, client) {
        const { guild } = msg;
        if (!guild) return msg.reply('This command only works in servers.');

        const textChannels = guild.channels.cache.filter(c => c.type === 0 || c.type === 'GUILD_TEXT').size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2 || c.type === 'GUILD_VOICE').size;
        const rolesCount = guild.roles.cache.size;
        const emojisCount = guild.emojis?.cache?.size || 0;

        const embed = {
            title: `Server Info: ${guild.name}`,
            fields: [
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Text Channels', value: String(textChannels), inline: true },
                { name: 'Voice Channels', value: String(voiceChannels), inline: true },
                { name: 'Roles', value: String(rolesCount), inline: true },
                { name: 'Emojis', value: String(emojisCount), inline: true }
            ],
            color: 0x5865F2
        };

        await msg.reply({ embeds: [embed] });
    }
};