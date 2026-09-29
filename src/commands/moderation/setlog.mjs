import { setLogChannel, removeLogChannel } from '../../handlers/logger.mjs';
import { ChannelType } from '@fluxerjs/core';

export default {
    name: 'setlog',
    description: 'Manage log channels simply.',
    usage: '_setlog auto\n_setlog off\n_setlog <type> <#channel>',
    async execute(msg, args) {
        if (!msg.member?.permissions?.has('ManageGuild')) {
            return msg.reply('Missing permissions.');
        }

        const arg0 = args[0]?.toLowerCase();
        const arg1 = args[1];
        const validTypes = ['all', 'messages', 'moderation', 'server', 'members'];

        if (!arg0) {
            const usageText = [
                '**Usage:**',
                '• `_setlog auto` - Automatically create a logs category and channels',
                '• `_setlog off` - Delete auto-created logs and disable logging',
                `• \`_setlog <type> <#channel>\` - Set a specific channel`,
                `• **Types:** ${validTypes.join(', ')}`
            ].join('\n');
            return msg.reply(usageText);
        }

        if (arg0 === 'auto') {
            try {
                const category = await msg.guild.createChannel({
                    name: 'logs',
                    type: ChannelType.GuildCategory ?? 4
                });

                for (const t of ['messages', 'moderation', 'server', 'members']) {
                    const ch = await msg.guild.createChannel({
                        name: `${t}-logs`,
                        type: ChannelType.GuildText ?? 0,
                        parentId: category.id
                    });
                    setLogChannel(msg.guild.id, t, ch.id);
                }

                return msg.reply('Created logs category and channels.');
            } catch (err) {
                console.error('Auto log error:', err);
                return msg.reply('Failed to create logs.');
            }
        }

        if (arg0 === 'off' || arg0 === 'delete') {
            try {
                const category = msg.guild.channels.cache.find(c => c.type === (ChannelType.GuildCategory ?? 4) && c.name.toLowerCase() === 'logs');
                if (category) {
                    const children = msg.guild.channels.cache.filter(c => c.parentId === category.id);
                    for (const [, ch] of children) await ch.delete().catch(() => {});
                    await category.delete().catch(() => {});
                }

                for (const t of validTypes) {
                    removeLogChannel(msg.guild.id, t);
                }

                return msg.reply('Logs disabled and channels cleaned up.');
            } catch (err) {
                console.error('Delete logs error:', err);
                return msg.reply('Failed to clean up logs.');
            }
        }

        let type = 'messages';
        let channelArg = arg0;

        if (validTypes.includes(arg0)) {
            type = arg0;
            channelArg = arg1;
        }

        const channelId = channelArg?.replace(/[^0-9]/g, '');
        const channel = msg.guild.channels.cache.get(channelId);

        if (!channel) {
            return msg.reply('Invalid channel or command syntax. Use `_setlog` for help.');
        }

        setLogChannel(msg.guild.id, type, channel.id);
        await msg.reply(`Log channel for [${type}] set to <#${channel.id}>.`);
    }
};