// ==========================================================================
// VartaPrime News - 30 Minutes Automatic Cron Scheduler
// ==========================================================================

const cron = require('node-cron');
const { fetchAllFeeds } = require('./rssFetcher');
const db = require('../db/database');

let isFetching = false;

function initScheduler() {
  console.log('[Scheduler] Initializing 30-minute automated RSS fetch cycle...');

  // Set next fetch time in stats
  const nextTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  db.updateStats({ nextFetchTime: nextTime });

  // Cron schedule: Every 30 minutes (e.g. at :00 and :30)
  // '*/30 * * * *'
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] ⏰ 30-minute cron triggered. Starting news update cycle...');
    if (isFetching) {
      console.log('[Scheduler] Previous fetch still running, skipping this trigger.');
      return;
    }
    isFetching = true;
    try {
      await fetchAllFeeds();
    } catch (err) {
      console.error('[Scheduler Error]:', err);
    } finally {
      isFetching = false;
    }
  });

  // Also run once after 3 seconds on server startup
  setTimeout(async () => {
    console.log('[Scheduler] 🚀 First-time initial fetch starting...');
    if (!isFetching) {
      isFetching = true;
      try {
        await fetchAllFeeds();
      } catch (err) {
        console.error('[Initial Fetch Error]:', err);
      } finally {
        isFetching = false;
      }
    }
  }, 3000);
}

// Manual trigger for Admin "ताज़ा करें" button
async function triggerNow() {
  if (isFetching) {
    return { success: false, message: 'समाचार फेचिंग पहले से जारी है, कृपया 10 सेकंड प्रतीक्षा करें।' };
  }
  isFetching = true;
  try {
    const result = await fetchAllFeeds();
    return { success: true, ...result };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    isFetching = false;
  }
}

module.exports = {
  initScheduler,
  triggerNow
};
