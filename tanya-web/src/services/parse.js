import Parse from 'parse';

// Use localhost only in actual development mode (npm run dev)
// When built (even if accessed via localhost), use production URLs
const isDevelopment = import.meta.env.DEV;
Parse.initialize('480c8e46-1901-44ab-9b6c-b00d0e3c3416', 'smsLaravMyMasterKey');

if (isDevelopment) {
  Parse.serverURL = 'http://localhost:3001/parse';
  Parse.liveQueryServerURL = 'ws://localhost:3001/parse';
} else {
  Parse.serverURL = 'https://tanya.dvarmalchus.co.il/parse';
  Parse.liveQueryServerURL = 'wss://tanya.dvarmalchus.co.il/parse';
}

// Initialize Live Query client connection
if (typeof window !== 'undefined') {
  // Wait for Parse to be ready, then setup Live Query listeners
  setTimeout(() => {
    const liveQueryClient = Parse.LiveQuery;
    
    if (liveQueryClient) {
      liveQueryClient.on('open', () => {
        // Live Query connected
      });
      
      liveQueryClient.on('close', () => {
        // Live Query closed
      });
      
      liveQueryClient.on('error', (error) => {
        if (isDevelopment) {
          console.error('Live Query connection error:', error);
        }
      });
    }
  }, 100);
}

export default Parse;
