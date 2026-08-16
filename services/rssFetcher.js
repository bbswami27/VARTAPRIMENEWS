// ==========================================================================
// VartaPrime News - Advanced RSS Ingestion & Intelligent Photo Collector
// ==========================================================================

const Parser = require('rss-parser');
const crypto = require('crypto');
const db = require('../db/database');
const { rewriteArticle, isHindiText } = require('./rewriter');
const { detectLocation } = require('./locations');

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VartaPrimeBot/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['image', 'image']
    ]
  }
});

// Comprehensive curated library of diverse, high-resolution news photos from the internet
const internetTopicPhotos = {
  // 1. Agriculture / Farmers / Rural Haryana
  farming: [
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80'
  ],

  // 2. Haryana Districts & City Infrastructure (Gurugram, Panipat, Highways)
  haryana_city: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80'
  ],

  // 3. Politics, Parliament, Ministers, Elections
  politics: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=800&auto=format&fit=crop&q=80'
  ],

  // 4. Police, Crime, Court, Law, Investigation
  crime_law: [
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=800&auto=format&fit=crop&q=80'
  ],

  // 5. Business, Stock Market, Gold, Economy, Banking
  business_market: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=800&auto=format&fit=crop&q=80'
  ],

  // 6. Cricket & Sports & Wrestling/Athletics
  sports: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80'
  ],

  // 7. Education, Schools, Exams, Universities, Results
  education: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80'
  ],

  // 8. Career, Jobs, Interviews, Offices
  career: [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'
  ],

  // 9. Health, Hospitals, Medicine, Doctors, Fitness
  health: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  ],

  // 10. Entertainment, Cinema, Bollywood, Music
  entertainment: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=80'
  ],

  // 11. Spirituality, Temples, Festivals, Puja, Astrology
  dharm: [
    'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80'
  ],

  // 12. Lifestyle, Fashion, Travel, Living
  lifestyle: [
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80'
  ],

  // 13. Weather, Rain, Monsoon, Environment
  weather: [
    'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80'
  ],

  // 14. World, International, Global Diplomacy
  world: [
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'
  ],

  // 15. Delhi, India Gate, Parliament, Metro, NCR
  delhi: [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598890777032-bde13fba5be3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=800&auto=format&fit=crop&q=80'
  ],

  // 16. Youth, Startups, Innovation, Skills & Aspirations
  youth: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80'
  ]
};

// Keyword mapping for deep context matching
const keywordMap = [
  { match: /(युवा|स्टार्टअप|इनोवेशन|नवाचार|उद्यमी|स्किल|हुनर|कौशल|प्रेरणा|सफलता|उपलब्धि)/i, pool: 'youth' },
  { match: /(किसान|खेत|फसल|धान|गेहूं|मंडी|यूरिया|खाद|ट्रैक्टर|नहर|MSP|कृषि)/i, pool: 'farming' },
  { match: /(क्रिकेट|मैच|आईपीएल|विकेट|रन|शतक|स्टेडियम|खिलाड़ी|ओलंपिक|कुश्ती|दंगल|पदक|मेडल|हॉकी|फुटबॉल|बीसीसीआई)/i, pool: 'sports' },
  { match: /(संसद|विधेयक|सरकार|विपक्ष|मुख्यमंत्री|सीएम|मंत्री|राज्यपाल|चुनाव|वोट|रैली|पार्टी|कांग्रेस|भाजपा|आप|आपसी|नारेबाजी|मोदी|राहुल|केजरीवाल)/i, pool: 'politics' },
  { match: /(कोर्ट|अदालत|सुप्रीम कोर्ट|हाई कोर्ट|जमानत|जेल|पुलिस|गिरफ्तार|हत्या|लूट|चोरी|ठगी|रिश्वत|ईडी|सीबीआई|मुकदमा|चालान|एनकाउंटर)/i, pool: 'crime_law' },
  { match: /(शेयर|सेंसेक्स|निफ्टी|बाजार|सोना|चांदी|रुपया|डॉलर|बैंक|लोन|ब्याज|आरबीआई|जीएसटी|टैक्स|कारोबार|कंपनी|मुनाफा|घाटा|पेट्रोल|डीजल)/i, pool: 'business_market' },
  { match: /(स्कूल|कॉलेज|यूनिवर्सिटी|विश्वविद्यालय|10वीं|12वीं|बोर्ड|रिजल्ट|परीक्षा|छात्र|छात्रा|एडमिट कार्ड|फीस|सिलेबस|प्रवेश|नीट|जेईई)/i, pool: 'education' },
  { match: /(भर्ती|नौकरी|सरकारी नौकरी|वैकेंसी|पदों|आवेदन|सैलरी|इंटरव्यू|रोजगार|यूपीएससी|एसएससी|एचएसएससी)/i, pool: 'career' },
  { match: /(अस्पताल|डॉक्टर|मरीज|डेंगू|मलेरिया|बुखार|दवाई|इलाज|वैक्सीन|ऑपरेशन|सेहत|स्वास्थ्य|डाइट|योग|बीमारी)/i, pool: 'health' },
  { match: /(फिल्म|सिनेमा|बॉलीवुड|एक्टर|एक्ट्रेस|अभिनेता|अभिनेत्री|ट्रेलर|बॉक्स ऑफिस|गाना|रिलीज|ओटीटी|वेब सीरीज|स्टार)/i, pool: 'entertainment' },
  { match: /(मंदिर|पूजा|आरती|व्रत|त्योहार|तीज|सावन|शिव|राम|कृष्ण|हनुमान|पंचांग|राशिफल|मुहूर्त|दर्शन|भक्त|श्रद्धालु)/i, pool: 'dharm' },
  { match: /(मौसम|बारिश|मानसून|गर्मी|सर्दी|कोहरा|तापमान|आंधी|तूफान|अलर्ट)/i, pool: 'weather' },
  { match: /(अमेरिका|रूस|चीन|यूक्रेन|इजरायल|गाजा|ब्रिटेन|यूरोप|यूएन|संयुक्त राष्ट्र|पाकिस्तान|विदेश|ग्लोबल|वैश्विक)/i, pool: 'world' },
  { match: /(दिल्ली|delhi|ncr|नोएडा|गाजियाबाद|मेट्रो|कनॉट प्लेस|चांदनी चौक|द्वारका|रोहिणी)/i, pool: 'delhi' },
  { match: /(गुरुग्राम|फरीदाबाद|पानीपत|हिसार|रोहतक|करनाल|अंबाला|सिरसा|कुरुक्षेत्र|पंचकूला|सोनीपत|रेवाड़ी|हरियाणा)/i, pool: 'haryana_city' }
];

// Helper to choose a unique, non-repeating contextual image based on title hash
function getContextualInternetImage(title, category) {
  const t = (title || '').toLowerCase();

  let selectedPool = 'haryana_city';

  // 1. Try keyword matching on title
  for (const item of keywordMap) {
    if (item.match.test(t)) {
      selectedPool = item.pool;
      break;
    }
  }

  // 2. Category fallback if no keyword matched
  if (selectedPool === 'haryana_city') {
    if (category === 'दिल्ली') selectedPool = 'delhi';
    else if (category === 'खेल') selectedPool = 'sports';
    else if (category === 'राजनीति') selectedPool = 'politics';
    else if (category === 'बिज़नेस') selectedPool = 'business_market';
    else if (category === 'क्राइम') selectedPool = 'crime_law';
    else if (category === 'शिक्षा') selectedPool = 'education';
    else if (category === 'करियर') selectedPool = 'career';
    else if (category === 'स्वास्थ्य') selectedPool = 'health';
    else if (category === 'मनोरंजन') selectedPool = 'entertainment';
    else if (category === 'धर्म') selectedPool = 'dharm';
    else if (category === 'लाइफस्टाइल') selectedPool = 'lifestyle';
    else if (category === 'विदेश') selectedPool = 'world';
  }

  const pool = internetTopicPhotos[selectedPool] || internetTopicPhotos['haryana_city'];
  
  // Use hash of title to deterministically pick a distinct photo from the pool
  const hash = crypto.createHash('md5').update(title || 'news').digest('hex');
  const index = parseInt(hash.substring(0, 4), 16) % pool.length;
  
  return pool[index];
}

// Extract real image from RSS XML item
function extractImageFromXml(item) {
  // 1. Enclosure
  if (item.enclosure && item.enclosure.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }

  // 2. Media Thumbnail
  if (item.mediaThumbnail) {
    if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0] && item.mediaThumbnail[0].$) {
      const u = item.mediaThumbnail[0].$.url;
      if (u && !u.includes('feedburner') && !u.includes('analytics')) return u;
    } else if (item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
      const u = item.mediaThumbnail.$.url;
      if (u && !u.includes('feedburner') && !u.includes('analytics')) return u;
    }
  }

  // 3. Media Content
  if (item.mediaContent) {
    if (Array.isArray(item.mediaContent) && item.mediaContent[0] && item.mediaContent[0].$) {
      const u = item.mediaContent[0].$.url;
      if (u && !u.includes('feedburner') && !u.includes('analytics')) return u;
    } else if (item.mediaContent.$ && item.mediaContent.$.url) {
      const u = item.mediaContent.$.url;
      if (u && !u.includes('feedburner') && !u.includes('analytics')) return u;
    }
  }

  // 4. Image tag
  if (typeof item.image === 'string' && item.image.startsWith('http')) {
    return item.image;
  }

  // 5. Extract from HTML body
  const html = (item.contentEncoded || '') + ' ' + (item.content || '') + ' ' + (item.description || '');
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1] && !match[1].includes('feedburner') && !match[1].includes('analytics') && !match[1].includes('spacer.gif')) {
    return match[1];
  }

  return null;
}

// Scrape OpenGraph image directly from article webpage if RSS didn't provide one
async function scrapeOgImage(url) {
  if (!url || url === '#' || url.includes('news.google.com')) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
      return ogMatch[1];
    }
  } catch (e) {
    // ignore timeout or network error, fallback to contextual image
  }
  return null;
}

// Clean HTML text
function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch single RSS feed
async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const articles = [];

    if (!parsed.items || !parsed.items.length) return articles;

    for (const item of parsed.items.slice(0, 15)) {
      const rawTitle = cleanText(item.title);
      if (!rawTitle) continue;

      let sourceName = feed.name;
      let cleanTitle = rawTitle;
      if (cleanTitle.includes(' - ')) {
        const parts = cleanTitle.split(' - ');
        if (parts.length > 1 && parts[parts.length - 1].length < 30) {
          sourceName = parts[parts.length - 1].trim();
          cleanTitle = parts.slice(0, -1).join(' - ').trim();
        }
      }

      // Strictly ensure only genuine Hindi articles are processed
      if (!isHindiText(cleanTitle)) {
        continue;
      }

      const description = cleanText(item.description || item.summary || item.contentSnippet || '');
      const link = item.link || item.guid || '#';

      // 1. Try extracting direct image from XML
      let imageUrl = extractImageFromXml(item);

      // 2. If still no image and we have a direct news link, attempt fast OG image extraction
      if (!imageUrl && link && !link.includes('news.google.com')) {
        imageUrl = await scrapeOgImage(link);
      }

      // 3. If still no image, pick a unique, topic-relevant image from our rich internet photo library
      if (!imageUrl) {
        imageUrl = getContextualInternetImage(cleanTitle, feed.category);
      }

      const contentText = cleanText(item.contentEncoded || item.content || description);
      const loc = detectLocation(cleanTitle, contentText, feed.category);

      const rawArticle = {
        title: cleanTitle,
        description: description.slice(0, 280),
        content: contentText,
        category: feed.category,
        state: loc.state,
        district: loc.district,
        source: sourceName,
        link: link,
        imageurl: imageUrl,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString()
      };

      // 4. Paraphrase and Rewrite into Copyright-Safe Journalistic Hindi
      const rewritten = rewriteArticle(rawArticle);
      rewritten.state = loc.state;
      rewritten.district = loc.district;
      articles.push(rewritten);
    }

    return articles;
  } catch (err) {
    console.warn(`[RSS Error] Failed fetching feed "${feed.name}" (${feed.url}):`, err.message);
    return [];
  }
}

// Fetch all active feeds
async function fetchAllFeeds() {
  const feeds = db.getFeeds().filter(f => f.enabled);
  console.log(`[RSS Fetcher] Fetching news and internet photos from ${feeds.length} active feeds...`);

  const startTime = Date.now();
  db.updateStats({ lastFetchStatus: 'इन प्रोसेस... (Fetching...)' });

  let allArticles = [];
  const batchSize = 4;
  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchFeed));
    for (const res of results) {
      allArticles.push(...res);
    }
  }

  const addedCount = db.addPending(allArticles);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  const nextTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  db.updateStats({
    lastFetchTime: new Date().toISOString(),
    lastFetchStatus: `सफल: ${addedCount} नई खबरें प्राप्त हुईं (${duration}s)`,
    nextFetchTime: nextTime
  });

  console.log(`[RSS Fetcher] Done! Added ${addedCount} new pending news items with diverse photos in ${duration}s.`);
  return { addedCount, totalScraped: allArticles.length, duration };
}

module.exports = {
  fetchAllFeeds,
  fetchFeed,
  getContextualInternetImage
};
