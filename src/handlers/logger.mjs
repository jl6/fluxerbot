import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { Events } from '@fluxerjs/core';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'logs.db'));

db.prepare(`
    CREATE TABLE IF NOT EXISTS log_channels (
        guild_id TEXT,
        type TEXT,
        channel_id TEXT,
        PRIMARY KEY (guild_id, type)
    )
`).run();

export const setLogChannel = (guildId, type, channelId) => {
    db.prepare(`
        INSERT INTO log_channels (guild_id, type, channel_id) 
        VALUES (?, ?, ?) 
        ON CONFLICT(guild_id, type) 
        DO UPDATE SET channel_id = ?
    `).run(guildId, type, channelId, channelId);
};

export const removeLogChannel = (guildId, type) => {
    db.prepare(`
        DELETE FROM log_channels WHERE guild_id = ? AND type = ?
    `).run(guildId, type);
};

export const getLogChannel = (guildId, type) => {
    const row = db.prepare(`
        SELECT channel_id FROM log_channels 
        WHERE guild_id = ? AND (type = ? OR type = 'all')
    `).get(guildId, type);
    return row?.channel_id;
};

export const sendLog = async (guild, type, embed) => {
    const channelId = getLogChannel(guild.id, type);
    if (!channelId) return;
    const ch = guild.channels.cache.get(channelId);
    if (ch) {
        await ch.send({ embeds: [embed] }).catch(() => {});
    }
};

export const setupLoggers = (client) => {
    client.on(Events.MessageCreate, async (msg) => {
        if (!msg || !msg.guild || msg.author?.bot || !msg.content) return;
        
        const isReply = !!msg.reference;
        const title = isReply ? 'Reply Sent' : 'Message Sent';
        
        let desc = `**Author:** <@${msg.author.id}>\n**Channel:** <#${msg.channel.id}>\n**Content:** ${msg.content}`;
        if (isReply) {
            desc += `\n**Reply To ID:** \`${msg.reference.messageId || 'Unknown'}\``;
        }

        const embed = {
            title: title,
            description: desc,
            color: 0x5865f2,
            timestamp: new Date().toISOString()
        };
        await sendLog(msg.guild, 'messages', embed);
    });

    client.on(Events.MessageDelete, async (msg) => {
        if (!msg || !msg.guild || msg.author?.bot) return;
        
        const authorInfo = msg.author ? `<@${msg.author.id}>` : 'Unknown User';
        const content = msg.content || 'Content not cached or unavailable';

        const embed = {
            title: 'Message Deleted',
            description: `**Author:** ${authorInfo}\n**Channel:** <#${msg.channel?.id || 'Unknown'}>\n**Content:** ${content}`,
            color: 0xed4245,
            timestamp: new Date().toISOString()
        };
        await sendLog(msg.guild, 'messages', embed);
    });

    client.on(Events.MessageUpdate, async (oldMsg, newMsg) => {
        if (!oldMsg || !oldMsg.guild || oldMsg.author?.bot) return;
        if (oldMsg.content === newMsg.content) return;

        const embed = {
            title: 'Message Edited',
            description: `**Author:** <@${oldMsg.author?.id || 'Unknown'}>\n**Channel:** <#${oldMsg.channel?.id}>\n**Before:** ${oldMsg.content || 'None'}\n**After:** ${newMsg.content || 'None'}`,
            color: 0xfee75c,
            timestamp: new Date().toISOString()
        };
        await sendLog(oldMsg.guild, 'messages', embed);
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        if (!member || !member.guild) return;
        const embed = {
            title: 'Member Joined',
            description: `**User:** <@${member.id}> (${member.user.tag})\n**Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
            color: 0x57f287,
            timestamp: new Date().toISOString()
        };
        await sendLog(member.guild, 'members', embed);
    });

    client.on(Events.GuildMemberRemove, async (member) => {
        if (!member || !member.guild) return;
        const embed = {
            title: 'Member Left',
            description: `**User:** <@${member.id}> (${member.user.tag})`,
            color: 0xed4245,
            timestamp: new Date().toISOString()
        };
        await sendLog(member.guild, 'members', embed);
    });

    client.on(Events.GuildBanAdd, async (ban) => {
        if (!ban || !ban.guild) return;
        const embed = {
            title: 'User Banned',
            description: `**User:** <@${ban.user.id}> (${ban.user.tag})`,
            color: 0xed4245,
            timestamp: new Date().toISOString()
        };
        await sendLog(ban.guild, 'moderation', embed);
    });

    client.on(Events.GuildBanRemove, async (ban) => {
        if (!ban || !ban.guild) return;
        const embed = {
            title: 'Ban Removed',
            description: `**User:** <@${ban.user.id}> (${ban.user.tag})`,
            color: 0x57f287,
            timestamp: new Date().toISOString()
        };
        await sendLog(ban.guild, 'moderation', embed);
    });

    client.on(Events.GuildMemberUpdate, async (oldMem, newMem) => {
        if (!newMem || !newMem.guild) return;
        const oldTimeout = oldMem.communicationDisabledUntilTimestamp;
        const newTimeout = newMem.communicationDisabledUntilTimestamp;
        if (oldTimeout !== newTimeout) {
            const isTimeout = newTimeout > Date.now();
            const embed = {
                title: isTimeout ? 'Member Timed Out' : 'Timeout Removed',
                description: `**User:** <@${newMem.id}>`,
                color: isTimeout ? 0xed4245 : 0x57f287,
                timestamp: new Date().toISOString()
            };
            await sendLog(newMem.guild, 'moderation', embed);
        }
    });

    client.on(Events.ChannelCreate, async (ch) => {
        if (!ch || !ch.guild) return;
        const embed = {
            title: 'Channel Created',
            description: `**Name:** #${ch.name}`,
            color: 0x57f287,
            timestamp: new Date().toISOString()
        };
        await sendLog(ch.guild, 'server', embed);
    });

    client.on(Events.ChannelDelete, async (ch) => {
        if (!ch || !ch.guild) return;
        const embed = {
            title: 'Channel Deleted',
            description: `**Name:** #${ch.name}`,
            color: 0xed4245,
            timestamp: new Date().toISOString()
        };
        await sendLog(ch.guild, 'server', embed);
    });

    client.on(Events.RoleCreate, async (role) => {
        if (!role || !role.guild) return;
        const embed = {
            title: 'Role Created',
            description: `**Name:** @${role.name}`,
            color: 0x57f287,
            timestamp: new Date().toISOString()
        };
        await sendLog(role.guild, 'server', embed);
    });

    client.on(Events.RoleDelete, async (role) => {
        if (!role || !role.guild) return;
        const embed = {
            title: 'Role Deleted',
            description: `**Name:** @${role.name}`,
            color: 0xed4245,
            timestamp: new Date().toISOString()
        };
        await sendLog(role.guild, 'server', embed);
    });
};