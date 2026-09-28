import { Events } from '@fluxerjs/core';
import { loadCommands } from '../handlers/commandhandler.mjs';

export default (client) => {
    client.on(Events.Ready, async () => {
        console.log(`Online`);
        await loadCommands(client, 'commands');
        console.log(`Loaded ${client.commands.size} commands.`);
    });
};