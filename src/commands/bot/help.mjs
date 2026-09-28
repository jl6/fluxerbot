export default {
    name: 'help',
    description: 'Displays all available commands with description and usage.',
    usage: '_help',
    async execute(msg, args, client) {
        const cmds = Array.from(client.commands.values());
        
        const fields = cmds.map(cmd => ({
            name: `${cmd.name}`,
            value: `Description: ${cmd.description || 'None'}\nUsage: \`${cmd.usage || `_${cmd.name}`}\``,
            inline: false
        }));

        const embed = {
            title: 'Commands',
            fields: fields,
            color: 0x5865F2
        };

        await msg.reply({ embeds: [embed] });
    }
};