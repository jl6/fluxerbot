import fs from 'node:fs';
import path from 'node:path';

const IGNORE = ['node_modules', '.git', '.env', 'package-lock.json', '.DS_Store','notes', 'notes.txt'
];

const buildTree = (dir, prefix = '') => {
    let result = '';
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => !IGNORE.includes(e.name));

    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        result += `${prefix}${pointer}${entry.name}\n`;

        if (entry.isDirectory()) {
            const extension = isLast ? '    ' : '│   ';
            result += buildTree(path.join(dir, entry.name), prefix + extension);
        }
    });

    return result;
};

export default {
    name: 'tree',
    description: 'Displays the project file tree structure.',
    usage: '_tree',
    async execute(msg, args, client) {
        try {
            const treeStr = buildTree(process.cwd());
            const output = `\`\`\`\n.\n${treeStr.slice(0, 1950)}\n\`\`\``;
            await msg.reply(output);
        } catch (err) {
            console.error('Tree error:', err);
            await msg.reply('Failed to generate file tree.');
        }
    }
};