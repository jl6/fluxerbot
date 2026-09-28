export default {
    name: 'uptime',
    async execute(msg, args, client) {
        const uptime = process.uptime();
        const hrs = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const secs = Math.floor(uptime % 60);

        await msg.reply(`Uptime: ${hrs}h ${mins}m ${secs}s`);
    }
};