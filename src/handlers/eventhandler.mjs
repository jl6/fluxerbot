import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const loadEvents = async (client) => {
    const eventsDir = path.join(process.cwd(), 'src', 'events');
    if (!fs.existsSync(eventsDir)) return;

    for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith('.mjs'))) {
        const fileUrl = pathToFileURL(path.join(eventsDir, file)).href;
        const mod = await import(fileUrl);
        const event = mod.default;
        if (event?.name && event?.execute) {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
};