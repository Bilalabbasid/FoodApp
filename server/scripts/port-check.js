#!/usr/bin/env node

import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
};

// Function to find next available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  const type = args[0]; // 'frontend' or 'backend'
  const preferredPort = parseInt(args[1]) || (type === 'frontend' ? 5173 : 3001);
  
  const availablePort = await findAvailablePort(preferredPort);
  
  if (availablePort !== preferredPort) {
    console.log(`⚠️  Port ${preferredPort} is busy, using port ${availablePort}`);
    
    if (type === 'backend') {
      // Update .env file with new backend port
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/PORT=\d+/, `PORT=${availablePort}`);
        fs.writeFileSync(envPath, envContent);
        console.log(`📝 Updated backend .env file with PORT=${availablePort}`);
      }
      
      // Update frontend API URL
      const frontendEnvPath = path.join(__dirname, '../.env');
      if (fs.existsSync(frontendEnvPath)) {
        let frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
        frontendEnvContent = frontendEnvContent.replace(
          /VITE_API_URL=http:\/\/localhost:\d+/,
          `VITE_API_URL=http://localhost:${availablePort}`
        );
        fs.writeFileSync(frontendEnvPath, frontendEnvContent);
        console.log(`📝 Updated frontend .env file with VITE_API_URL=http://localhost:${availablePort}/api/v1`);
      }
    }
  }
  
  console.log(`✅ Using port ${availablePort} for ${type}`);
  process.exit(0);
};

main().catch(console.error);
