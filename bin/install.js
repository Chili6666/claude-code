#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [target, action, name] = process.argv.slice(2);

const TARGETS = {
  commands: {
    available: ['commit', 'organize-imports', 'check-memoization', 'start-interviewing', 'plan-phases'],
    srcDir: 'commands',
    destDir: path.join('.claude', 'commands'),
    ext: '.md',
  },
  rules: {
    available: ['security', 'typescript'],
    srcDir: 'rules',
    destDir: path.join('.claude', 'rules'),
    ext: '.md',
  },
};

const PROFILES = {
  typescript: {
    description: 'TypeScript development: type safety rules + quality commands',
    rules:    ['typescript', 'security'],
    commands: ['commit', 'organize-imports', 'check-memoization', 'plan-phases', 'start-interviewing'],
  },
};

function printUsage() {
  console.log('Usage: npx github:Chili6666/claude-code <target> add <name>');
  console.log('');
  console.log('Targets:');
  for (const [t, cfg] of Object.entries(TARGETS)) {
    console.log(`  ${t}    available: ${cfg.available.join(', ')}`);
  }
  console.log('');
  console.log('Profiles (install a curated bundle with: profile add <name>):');
  for (const [pName, pCfg] of Object.entries(PROFILES)) {
    console.log(`  ${pName}    ${pCfg.description}`);
    console.log(`             rules:    ${pCfg.rules.join(', ')}`);
    console.log(`             commands: ${pCfg.commands.join(', ')}`);
  }
}

if (target === 'profile') {
  if (action !== 'add') {
    console.error(`Error: unknown action "${action || ''}". Only "add" is supported.`);
    printUsage();
    process.exit(1);
  }

  const profile = PROFILES[name];
  if (!name || !profile) {
    console.error(`Error: unknown profile "${name || ''}"`);
    console.error(`Available profiles: ${Object.keys(PROFILES).join(', ')}`);
    process.exit(1);
  }

  console.log(`Installing profile "${name}"...`);
  console.log('');

  for (const [itemType, items] of [['rules', profile.rules], ['commands', profile.commands]]) {
    const cfg = TARGETS[itemType];
    for (const itemName of items) {
      const src     = path.join(__dirname, '..', cfg.srcDir, `${itemName}${cfg.ext}`);
      const destDir = path.join(process.cwd(), cfg.destDir);
      const dest    = path.join(destDir, `${itemName}${cfg.ext}`);
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Installed ${itemType}/${itemName} → ${dest}`);
    }
  }

  console.log('');
  console.log(`✓ Profile "${name}" installed successfully.`);
  process.exit(0);
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
console.log(`✓ Installed ${target}/${name} → ${dest}`);
