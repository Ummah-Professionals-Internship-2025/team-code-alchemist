const concurrently = require('concurrently');

console.log('🚀 Starting Ummah Professionals Backend Servers...\n');

console.log('This will start:');
console.log('- Forms Backend: http://localhost:3001');
console.log('- User Portal Backend: http://localhost:3003\n');

console.log('Press Ctrl+C to stop all services\n');

// Start both backend servers
concurrently([
  {
    command: 'cd forms/backend && set PORT=3001 && node server.js',
    name: 'forms-backend',
    prefixColor: 'yellow'
  },
  {
    command: 'cd userportal/backend && set PORT=3003 && node server.js',
    name: 'userportal-backend',
    prefixColor: 'magenta'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n✅ Stopping all backend servers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n✅ Stopping all backend servers...');
  process.exit(0);
});
