import { Events } from '@fluxerjs/core';
import { loadCommands } from '../handlers/commandhandler.mjs';
import { loadEvents } from '../handlers/eventhandler.mjs';

export default async function readyHandler(client) {
    client.once(Events.Ready, async () => {
        console.log(`Online`);
        await loadCommands(client, 'commands');
        await loadEvents(client);
        console.log(`Loaded ${client.commands.size} commands.`);
    });
}