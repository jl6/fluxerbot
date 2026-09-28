export default {
    name: 'clear',
    async execute(msg, args, client) {
        const count = parseInt(args[0], 10);
        if (!count || isNaN(count) || count < 1 || count > 100) {
            return msg.reply('Provide a number between 1 and 100.');
        }

        try {
            const fetched = await msg.channel.messages.fetch({ limit: count });
            const ids = Array.from(fetched.keys());
            await msg.channel.bulkDelete(ids, true);
        } catch (err) {
            console.error('Clear error:', err);
            await msg.reply('Failed to clear messages.');
        }
    }
};