const localtunnel = require('localtunnel');

let tunnelInstance = null;

async function startTunnel() {
  try {
    console.log('[Tunnel] Starting secure localtunnel on port 3000...');
    tunnelInstance = await localtunnel({ port: 3000, subdomain: 'vartaprime-live-news' });
    
    console.log(`\n========================================================`);
    console.log(`🌐 LIVE PUBLIC URL: ${tunnelInstance.url}`);
    console.log(`========================================================\n`);

    tunnelInstance.on('close', () => {
      console.log('[Tunnel] Tunnel closed. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    tunnelInstance.on('error', (err) => {
      console.error('[Tunnel Error]', err.message);
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('[Tunnel Init Error]', err.message);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
