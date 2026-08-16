// ==========================================================================
// VartaPrime News - Google Apps Script (वैकल्पिक मुफ़्त Google Sheet ऑटोमेशन)
// ==========================================================================
// यदि आप बिना किसी सर्वर के Google Sheets और Apps Script से वेबसाइट चलाना चाहते हैं,
// तो यह कोड Google Sheet के Extensions > Apps Script में पेस्ट करें।
// ==========================================================================

const RSS_FEEDS = [
  { name: 'Google News हरियाणा', category: 'हरियाणा', url: 'https://news.google.com/rss/search?q=%E0%A4%B9%E0%A4%B0%E0%A4%BF%E0%A4%AF%E0%A4%BE%E0%A4%A3%E0%A4%BE+when:3d&hl=hi&gl=IN&ceid=IN:hi' },
  { name: 'Google News देश', category: 'देश', url: 'https://news.google.com/rss/headlines/section/topic/NATION?hl=hi&gl=IN&ceid=IN:hi' },
  { name: 'BBC Hindi', category: 'देश', url: 'https://feeds.bbci.co.uk/hindi/rss.xml' },
  { name: 'Google News बिज़नेस', category: 'बिज़नेस', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi' },
  { name: 'Google News खेल', category: 'खेल', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=hi&gl=IN&ceid=IN:hi' },
  { name: 'Google News मनोरंजन', category: 'मनोरंजन', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=hi&gl=IN&ceid=IN:hi' }
];

// Sheet Setup
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let approvedSheet = ss.getSheetByName('Approved');
  if (!approvedSheet) {
    approvedSheet = ss.insertSheet('Approved');
    approvedSheet.appendRow(['ID', 'Title', 'Description', 'Category', 'Source', 'ImageURL', 'Link', 'ApprovedAt', 'IsBreaking']);
    approvedSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#E2E8F0');
  }

  let pendingSheet = ss.getSheetByName('Pending');
  if (!pendingSheet) {
    pendingSheet = ss.insertSheet('Pending');
    pendingSheet.appendRow(['ID', 'Title', 'Description', 'Category', 'Source', 'ImageURL', 'Link', 'FetchedAt']);
    pendingSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#FEF08A');
  }

  // Set 30 minute trigger
  ScriptApp.newTrigger('fetchNewsCron')
    .timeBased()
    .everyMinutes(30)
    .create();
}

// 30-min Auto Fetcher
function fetchNewsCron() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pendingSheet = ss.getSheetByName('Pending');
  const approvedSheet = ss.getSheetByName('Approved');

  const existingUrls = new Set();
  if (approvedSheet.getLastRow() > 1) {
    const appUrls = approvedSheet.getRange(2, 7, approvedSheet.getLastRow() - 1, 1).getValues();
    appUrls.forEach(r => existingUrls.add(r[0]));
  }
  if (pendingSheet.getLastRow() > 1) {
    const penUrls = pendingSheet.getRange(2, 7, pendingSheet.getLastRow() - 1, 1).getValues();
    penUrls.forEach(r => existingUrls.add(r[0]));
  }

  for (const feed of RSS_FEEDS) {
    try {
      const response = UrlFetchApp.fetch(feed.url, { muteHttpExceptions: true });
      const xml = response.getContentText();
      const document = XmlService.parse(xml);
      const root = document.getRootElement();
      const channel = root.getChild('channel');
      if (!channel) continue;

      const items = channel.getChildren('item');
      for (const item of items.slice(0, 10)) {
        const title = item.getChildText('title') || '';
        const link = item.getChildText('link') || '';
        const description = (item.getChildText('description') || '').replace(/<[^>]+>/g, '');
        const pubDate = item.getChildText('pubDate') || new Date().toISOString();

        if (!link || existingUrls.has(link)) continue;
        existingUrls.add(link);

        const id = 'gs_' + new Date().getTime() + '_' + Math.floor(Math.random()*1000);
        pendingSheet.appendRow([
          id,
          title,
          description.slice(0, 280),
          feed.category,
          feed.name,
          'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
          link,
          new Date().toISOString()
        ]);
      }
    } catch (e) {
      Logger.log('Error fetching feed: ' + feed.name + ' - ' + e.message);
    }
  }
}

// Web App API for public website (doGet)
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const approvedSheet = ss.getSheetByName('Approved');
  
  const news = [];
  if (approvedSheet && approvedSheet.getLastRow() > 1) {
    const rows = approvedSheet.getRange(2, 1, approvedSheet.getLastRow() - 1, 9).getValues();
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i];
      news.push({
        id: r[0],
        title: r[1],
        description: r[2],
        category: r[3],
        source: r[4],
        imageurl: r[5],
        link: r[6],
        approvedAt: r[7],
        isBreaking: r[8] === true || r[8] === 'true'
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify(news))
    .setMimeType(ContentService.MimeType.JSON);
}
