const concurrently = require('concurrently');

console.log('🚀 Starting Ummah Professionals Frontend Applications...\n');

console.log('This will start:');
console.log('- Forms Frontend: http://localhost:3000');
console.log('- User Portal Frontend: http://localhost:3002\n');

console.log('Press Ctrl+C to stop all services\n');

// Start both frontend applications
concurrently([
  {
    command: 'cd forms/frontend && set PORT=3000 && npm start',
    name: 'forms-frontend',
    prefixColor: 'blue'
  },
  {
    command: 'cd userportal && set PORT=3002 && npm start',
    name: 'userportal-frontend',
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n✅ Stopping all frontend applications...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n✅ Stopping all frontend applications...');
  process.exit(0);
});
