const timeAgo = (d) => {
    if (!d || isNaN(d.getTime())) return 'Unknown';
    const days = Math.floor(Math.abs(new Date() - d) / 86400000);
    const yrs = Math.floor(days / 365);
    const mos = Math.floor((days % 365) / 30);
    const rem = days % 365;
    const parts = [];
    if (yrs) parts.push(`${yrs}y`);
    if (mos) parts.push(`${mos}m`);
    if (rem || !parts.length) parts.push(`${rem}d`);
    return `${parts.join(' ')} ago`;
};

export default {
    name: 'myinfo',
    async execute(msg, args, client) {
        const target = msg.mentions?.users?.first() || msg.author;
        const member = msg.guild?.members?.cache?.get(target.id) || msg.member;
        
        let created = target.createdAt;
        if (!created && target.id) {
            created = new Date(Number((BigInt(target.id) >> 22n) + 1420070400000n));
        }

        const joined = member?.joinedAt || (member?.joinedTimestamp ? new Date(member.joinedTimestamp) : null);
        const createdDateStr = created ? created.toUTCString() : 'Unknown';
        const joinedDateStr = joined ? joined.toUTCString() : 'N/A';

        const txt = [
            `User: ${target.username} (${target.id})`,
            `Created: ${createdDateStr} (${timeAgo(created)})`,
            `Joined: ${joinedDateStr} (${joined ? timeAgo(joined) : 'N/A'})`
        ].join('\n');

        await msg.reply(txt);
    }
};