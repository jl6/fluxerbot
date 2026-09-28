import 'dotenv/config';
import { Client, Events, parsePrefixCommand } from '@fluxerjs/core';
import readyHandler from './client/ready.mjs';

const client = new Client();
const PREFIX = '_';

client.commands = new Map();

readyHandler(client);

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.content) return;

    const parsed = parsePrefixCommand(msg.content, PREFIX);
    if (!parsed) return;

    const cmd = client.commands.get(parsed.command);
    if (!cmd) return;

    try {
        await cmd.execute(msg, parsed.args, client);
    } catch (err) {
        console.error(`Command error (${parsed.command}):`, err);
        await msg.reply('Failed to execute command.');
    }
});

client.login(process.env.BOT_TOKEN);