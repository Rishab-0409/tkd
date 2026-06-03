const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.dirname(__filename);
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\x1b[36m%s\x1b[0m', '🥋 Taekwondo Scoring System');
console.log('\x1b[36m%s\x1b[0m', '============================\n');

// Check if node_modules exist, if not install dependencies
const installDependencies = () => {
  return new Promise((resolve) => {
    console.log('\x1b[33m%s\x1b[0m', '📦 Installing dependencies...\n');

    // Install backend
    if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
      console.log('Installing backend dependencies...');
      const backendInstall = spawn('npm', ['install'], { cwd: backendDir, stdio: 'inherit' });
      backendInstall.on('close', () => {
        // Install frontend
        if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
          console.log('\nInstalling frontend dependencies (this may take a few minutes)...');
          const frontendInstall = spawn('npm', ['install'], { cwd: frontendDir, stdio: 'inherit' });
          frontendInstall.on('close', () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    } else if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
      console.log('Installing frontend dependencies (this may take a few minutes)...');
      const frontendInstall = spawn('npm', ['install'], { cwd: frontendDir, stdio: 'inherit' });
      frontendInstall.on('close', () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};

const startServers = async () => {
  await installDependencies();

  console.log('\n\x1b[32m%s\x1b[0m', '✅ Dependencies installed!\n');

  console.log('\x1b[36m%s\x1b[0m', 'Starting servers...\n');

  // Start backend
  console.log('\x1b[32m%s\x1b[0m', '🚀 Backend server starting on http://localhost:5000');
  const backend = spawn('node', ['server.js'], { cwd: backendDir, stdio: 'inherit' });

  // Wait a bit before starting frontend to ensure backend is ready
  setTimeout(() => {
    console.log('\x1b[32m%s\x1b[0m', '🚀 Frontend starting on http://localhost:3000\n');
    const frontend = spawn('npm', ['start'], { cwd: frontendDir, stdio: 'inherit' });

    frontend.on('error', (err) => {
      console.error('\x1b[31m%s\x1b[0m', '❌ Frontend error:', err);
    });
  }, 2000);

  backend.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', '❌ Backend error:', err);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down servers...');
    backend.kill();
    setTimeout(() => process.exit(0), 1000);
  });
};

startServers().catch(err => {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error:', err);
  process.exit(1);
});
