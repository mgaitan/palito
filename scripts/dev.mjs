import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
let level = '1';
const viteArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--level') {
    level = args[++i] ?? level;
  } else if (arg.startsWith('--level=')) {
    level = arg.slice('--level='.length);
  } else {
    viteArgs.push(arg);
  }
}

if (!['1', '2', '3'].includes(level)) {
  console.error('Error: --level debe ser 1, 2 o 3.');
  process.exit(1);
}

const child = spawn(
  'vite',
  ['--open', `/?level=${level}`, ...viteArgs],
  { stdio: 'inherit', shell: true }
);

child.on('exit', code => process.exit(code ?? 0));
