#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [target, action, name] = process.argv.slice(2);

const TARGETS = {
  commands: {
    available: ['commit', 'organize-imports', 'check-memoization'],
    srcDir: 'commands',
    destDir: path.join('.claude', 'commands'),
    ext: '.md',
  },
};

function printUsage() {
  console.log('Usage: npx github:Chili6666/claude-code <target> add <name>');
  console.log('');
  console.log('Targets:');
  for (const [t, cfg] of Object.entries(TARGETS)) {
    console.log(`  ${t}    available: ${cfg.available.join(', ')}`);
  }
}

if (!target || !TARGETS[target]) {
  console.error(`Error: unknown target "${target || ''}"`);
  printUsage();
  process.exit(1);
}

if (action !== 'add') {
  console.error(`Error: unknown action "${action || ''}". Only "add" is supported.`);
  printUsage();
  process.exit(1);
}

const cfg = TARGETS[target];

if (!name || !cfg.available.includes(name)) {
  console.error(`Error: unknown ${target} name "${name || ''}"`);
  console.error(`Available: ${cfg.available.join(', ')}`);
  process.exit(1);
}

const src = path.join(__dirname, '..', cfg.srcDir, `${name}${cfg.ext}`);
const destDir = path.join(process.cwd(), cfg.destDir);
const dest = path.join(destDir, `${name}${cfg.ext}`);

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`✓ Installed /${name} → ${dest}`);
