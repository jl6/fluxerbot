import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadCommands(client, dir = 'commands') {
    const fullPath = path.join(process.cwd(), 'src', dir);
    if (!fs.existsSync(fullPath)) return;

    for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
        const resPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await loadCommands(client, resPath);
        } else if (entry.isFile() && entry.name.endsWith('.mjs')) {
            const fileUrl = pathToFileURL(path.join(process.cwd(), 'src', resPath)).href;
            const mod = await import(fileUrl);
            if (mod.default?.name) {
                client.commands.set(mod.default.name, mod.default);
                console.log(`Loaded command: ${mod.default.name}`);
            }
        }
    }
}