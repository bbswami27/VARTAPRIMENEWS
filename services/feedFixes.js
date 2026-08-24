// VartaPrime News - RSS feed repair bootstrap
const fs = require('fs');
const path = require('path');

const CORRECT_REWARI =
  'https://news.google.com/rss/search?q=%E0%A4%B0%E0%A5%87%E0%A4%B5%E0%A4%BE%E0%A4%A1%E0%A4%BC%E0%A5%80+when:3d&hl=hi&gl=IN&ceid=IN:hi';

function patchPersistedFeeds() {
  const file = path.join(__dirname, '..', 'data', 'feeds.json');
  if (!fs.existsSync(file)) return;
  try {
    const feeds = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
    let changed = false;
    for (const feed of feeds) {
      if (feed && feed.id === 'feed-haryana-rewari') {
        if (feed.url !== CORRECT_REWARI || feed.enabled !== true) {
          feed.url = CORRECT_REWARI;
          feed.enabled = true;
          changed = true;
        }
      }
    }
    if (changed) {
      fs.writeFileSync(file, JSON.stringify(feeds, null, 2), 'utf8');
      console.log('[FeedFixes] Rewari persisted RSS feed corrected and enabled.');
    }
  } catch (err) {
    console.error('[FeedFixes] persisted feeds repair failed:', err.message);
  }
}

function patchDefaultFeedSource() {
  const file = path.join(__dirname, 'defaultFeeds.js');
  if (!fs.existsSync(file)) return;
  try {
    const src = fs.readFileSync(file, 'utf8');
    const bad = 'https://news.google.com/rss/search?q=%E0%A4%B0%E0%A5%87%E0%A4%Walk%E0%A4%BE%E0%A4%A1%E0%A4%BC%E0%A5%80+when:3d&hl=hi&gl=IN&ceid=IN:hi';
    if (src.includes(bad)) {
      fs.writeFileSync(file, src.replace(bad, CORRECT_REWARI), 'utf8');
      console.log('[FeedFixes] Rewari default RSS source corrected.');
    }
  } catch (err) {
    console.error('[FeedFixes] default feed source repair failed:', err.message);
  }
}

patchDefaultFeedSource();
patchPersistedFeeds();
