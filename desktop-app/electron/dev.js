// Development launcher that starts Vite and then opens Electron.
const { spawn } = require('child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const viteProcess = spawn(npmCommand, ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

setTimeout(() => {
  const electronProcess = spawn(npmCommand, ['exec', 'electron', '.'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  electronProcess.on('exit', (code) => {
    process.exitCode = code || 0;
    viteProcess.kill();
  });
}, 5000);
