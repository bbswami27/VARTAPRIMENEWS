// ==========================================================================
// VartaPrimeNews - Persistent JSON Database Layer
// ==========================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const defaultFeeds = require('../services/defaultFeeds');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PENDING_FILE = path.join(DATA_DIR, 'pending.json');
const APPROVED_FILE = path.join(DATA_DIR, 'approved.json');
const REJECTED_FILE = path.join(DATA_DIR, 'rejected.json');
const FEEDS_FILE = path.join(DATA_DIR, 'feeds.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure directory and files exist
function init() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filesWithDefaults = [
    { file: PENDING_FILE, def: [] },
    { file: APPROVED_FILE, def: getInitialApprovedNews() },
    { file: REJECTED_FILE, def: [] },
    { file: FEEDS_FILE, def: defaultFeeds },
    { file: HISTORY_FILE, def: {} },
    { 
      file: STATS_FILE, 
      def: { 
        lastFetchTime: null, 
        lastFetchStatus: 'Ready', 
        nextFetchTime: null, 
        totalFetched: 0,
        totalApproved: 0,
        autoApproveEnabled: false
      } 
    }
  ];

  for (const item of filesWithDefaults) {
    if (!fs.existsSync(item.file)) {
      fs.writeFileSync(item.file, JSON.stringify(item.def, null, 2), 'utf8');
    }
  }
}

function readJSON(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || JSON.stringify(defaultValue));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  try {
    let toWrite = data;
    if (filePath === APPROVED_FILE && Array.isArray(data)) {
      toWrite = data.slice(0, 150);
    } else if (filePath === PENDING_FILE && Array.isArray(data)) {
      toWrite = data.slice(0, 100);
    } else if (filePath === REJECTED_FILE && Array.isArray(data)) {
      toWrite = data.slice(0, 50);
    } else if (filePath === HISTORY_FILE && typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length > 1000) {
        const trimmed = {};
        keys.slice(-1000).forEach(k => trimmed[k] = data[k]);
        toWrite = trimmed;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

function generateHash(str) {
  return crypto.createHash('md5').update(str || '').digest('hex');
}

// Initial placeholder approved news so site looks alive on first boot
function getInitialApprovedNews() {
  const now = new Date().toISOString();
  return [
    {
      id: "initial-lead-1",
      title: "हरियाणा में नई औद्योगिक नीति लागू: युवाओं के लिए लाखों रोजगार के अवसर होंगे सृजित",
      description: "हरियाणा सरकार ने राज्य में उद्योगों को बढ़ावा देने और स्थानीय युवाओं के लिए रोजगार के नए अवसर पैदा करने हेतु नई व्यापक औद्योगिक नीति को हरी झंडी दे दी है। इसके तहत आगामी 3 वर्षों में भारी निवेश आकर्षित करने का लक्ष्य रखा गया है।",
      content: "हरियाणा सरकार ने राज्य में उद्योगों को बढ़ावा देने और स्थानीय युवाओं के लिए रोजगार के नए अवसर पैदा करने हेतु नई व्यापक औद्योगिक नीति को हरी झंडी दे दी है। इसके तहत आगामी 3 वर्षों में भारी निवेश आकर्षित करने का लक्ष्य रखा गया है। सरकार ने विभिन्न जिलों में इंडस्ट्रियल हब और विशेष आर्थिक क्षेत्रों (SEZ) के बुनियादी ढांचे को मजबूत करने की योजना भी बनाई है।",
      category: "हरियाणा",
      source: "वार्ताप्राइम डेस्क",
      link: "#",
      imageurl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=900&auto=format&fit=crop&q=80",
      publishedAt: now,
      approvedAt: now,
      status: "approved",
      isBreaking: true,
      isHero: true,
      views: 1240
    },
    {
      id: "initial-2",
      title: "संसद के सत्र में अहम विधायी प्रस्तावों पर चर्चा, विकास योजनाओं पर विशेष जोर",
      description: "संसद के वर्तमान सत्र में आज कई महत्वपूर्ण प्रस्तावों और राष्ट्रीय विकास योजनाओं पर गहन चर्चा हुई। जनहित की योजनाओं को समयबद्ध तरीके से पूरा करने का संकल्प दोहराया गया।",
      content: "संसद के वर्तमान सत्र में आज कई महत्वपूर्ण प्रस्तावों और राष्ट्रीय विकास योजनाओं पर गहन चर्चा हुई। जनहित की योजनाओं को समयबद्ध तरीके से पूरा करने का संकल्प दोहराया गया।",
      category: "राजनीति",
      source: "राष्ट्रीय संवाद",
      link: "#",
      imageurl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
      publishedAt: now,
      approvedAt: now,
      status: "approved",
      isBreaking: true,
      views: 890
    },
    {
      id: "initial-3",
      title: "भारतीय खेल दल का शानदार प्रदर्शन: अंतरराष्ट्रीय मंच पर देश का गौरव बढ़ाया",
      description: "भारतीय खिलाड़ियों ने शानदार खेल भावना और दृढ़ संकल्प का परिचय देते हुए अंतरराष्ट्रीय प्रतियोगिता में ऐतिहासिक जीत दर्ज की।",
      content: "भारतीय खिलाड़ियों ने शानदार खेल भावना और दृढ़ संकल्प का परिचय देते हुए अंतरराष्ट्रीय प्रतियोगिता में ऐतिहासिक जीत दर्ज की। देशभर में खेल प्रेमियों में भारी उत्साह देखने को मिला।",
      category: "खेल",
      source: "खेल डेस्क",
      link: "#",
      imageurl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=80",
      publishedAt: now,
      approvedAt: now,
      status: "approved",
      isBreaking: false,
      views: 740
    },
    {
      id: "initial-4",
      title: "शेयर बाजार में मजबूती: सेंसेक्स और निफ्टी में सकारात्मक रुझान बरकरार",
      description: "भारतीय वित्तीय बाजारों में निवेशकों का भरोसा लगातार बढ़ रहा है। प्रमुख सूचकांकों में आज मजबूती के साथ कारोबार हुआ।",
      content: "भारतीय वित्तीय बाजारों में निवेशकों का भरोसा लगातार बढ़ रहा है। प्रमुख सूचकांकों में आज मजबूती के साथ कारोबार हुआ।",
      category: "बिज़नेस",
      source: "मार्केट रिपोर्ट",
      link: "#",
      imageurl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
      publishedAt: now,
      approvedAt: now,
      status: "approved",
      isBreaking: false,
      views: 610
    },
    {
      id: "initial-5",
      title: "पानीपत व एनसीआर में आधुनिक इंफ्रास्ट्रक्चर का विस्तार, कनेक्टिविटी होगी सुगम",
      description: "क्षेत्र में कनेक्टिविटी को तेज और सुगम बनाने के लिए नए एलिवेटेड कॉरिडोर और बाईपास परियोजनाओं का काम तेजी से आगे बढ़ रहा है।",
      content: "क्षेत्र में कनेक्टिविटी को तेज और सुगम बनाने के लिए नए एलिवेटेड कॉरिडोर और बाईपास परियोजनाओं का काम तेजी से आगे बढ़ रहा है। इससे दैनिक यात्रियों को भारी राहत मिलेगी।",
      category: "हरियाणा",
      source: "हरियाणा वार्ता",
      link: "#",
      imageurl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
      publishedAt: now,
      approvedAt: now,
      status: "approved",
      isBreaking: false,
      views: 520
    }
  ];
}

// ---------------- Database Methods ----------------

const db = {
  init,

  // Check if article was already ingested before
  isDuplicate(url, title) {
    const history = readJSON(HISTORY_FILE, {});
    const hash = generateHash(url || title);
    return !!history[hash];
  },

  markAsIngested(url, title) {
    const history = readJSON(HISTORY_FILE, {});
    const hash = generateHash(url || title);
    history[hash] = Date.now();
    writeJSON(HISTORY_FILE, history);
  },

  // Add freshly scraped articles to PENDING
  addPending(articles) {
    if (!articles || !articles.length) return 0;
    const pending = readJSON(PENDING_FILE, []);
    const history = readJSON(HISTORY_FILE, {});
    const settings = readJSON(STATS_FILE, {});

    let addedCount = 0;
    const autoApproved = [];

    for (const article of articles) {
      const hash = generateHash(article.link || article.title);
      if (history[hash]) continue; // Skip duplicate

      history[hash] = Date.now();
      const newsItem = {
        id: 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: article.title ? article.title.trim() : 'ताज़ा समाचार',
        description: article.description ? article.description.trim() : '',
        content: article.content || article.description || '',
        category: article.category || 'देश',
        state: article.state || 'हरियाणा',
        district: article.district || 'पानीपत',
        source: article.source || 'RSS Feed',
        sourceType: article.sourceType || 'rss',
        reporterName: article.reporterName || '',
        link: article.link || '#',
        imageurl: article.imageurl || '',
        publishedAt: article.publishedAt || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        status: 'pending',
        isBreaking: false,
        isHero: false,
        isRewritten: !!article.isRewritten,
        views: 0
      };

      if (settings.autoApproveEnabled) {
        newsItem.status = 'approved';
        newsItem.approvedAt = new Date().toISOString();
        autoApproved.push(newsItem);
      } else {
        pending.unshift(newsItem);
      }
      addedCount++;
    }

    writeJSON(HISTORY_FILE, history);
    if (pending.length > 0) writeJSON(PENDING_FILE, pending);

    if (autoApproved.length > 0) {
      const approved = readJSON(APPROVED_FILE, []);
      approved.unshift(...autoApproved);
      writeJSON(APPROVED_FILE, approved);
    }

    return addedCount;
  },

  // Add submission from field reporter to PENDING
  addReporterSubmission(data) {
    const pending = readJSON(PENDING_FILE, []);
    const newsItem = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: data.title ? data.title.trim() : 'विशेष ग्राउंड रिपोर्ट',
      description: data.description ? data.description.trim() : (data.content || '').slice(0, 240),
      content: data.content || data.description || '',
      category: data.category || 'हरियाणा',
      state: data.state || 'हरियाणा',
      district: data.district || 'पानीपत',
      source: data.reporterName ? `${data.reporterName} (${data.district || 'ब्यूरो'})` : 'VartaPrimeNews संवाददाता',
      sourceType: data.sourceType || 'reporter',
      submissionPlatform: data.submissionPlatform || 'web',
      reporterName: data.reporterName || 'फील्ड रिपोर्टर',
      reporterPhone: data.reporterPhone || '',
      link: '#',
      imageurl: data.imageurl || '',
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      status: 'pending',
      isBreaking: !!data.isBreaking,
      isHero: false,
      isRewritten: false,
      views: 0
    };

    pending.unshift(newsItem);
    writeJSON(PENDING_FILE, pending);
    return newsItem;
  },

  // Get Pending News for Admin
  getPending(filter = {}) {
    let list = readJSON(PENDING_FILE, []);
    if (filter.category && filter.category !== 'all') {
      list = list.filter(item => item.category === filter.category);
    }
    if (filter.district && filter.district !== 'all') {
      list = list.filter(item => item.district === filter.district);
    }
    if (filter.state && filter.state !== 'all') {
      list = list.filter(item => item.state === filter.state);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(item => (item.title && item.title.toLowerCase().includes(q)) || (item.description && item.description.toLowerCase().includes(q)));
    }
    return list;
  },

  // Get Approved (Public Live) News with State & District Filters
  getApproved(filter = {}) {
    let list = readJSON(APPROVED_FILE, []);
    if (filter.category && filter.category !== 'all' && filter.category !== 'home') {
      list = list.filter(item => item.category === filter.category);
    }
    if (filter.district && filter.district !== 'all') {
      list = list.filter(item => item.district === filter.district);
    }
    if (filter.state && filter.state !== 'all') {
      list = list.filter(item => item.state === filter.state);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(item => (item.title && item.title.toLowerCase().includes(q)) || (item.description && item.description.toLowerCase().includes(q)));
    }
    if (filter.limit) {
      list = list.slice(0, parseInt(filter.limit));
    }
    return list;
  },

  // Get single news by ID
  getById(id) {
    const approved = readJSON(APPROVED_FILE, []);
    const foundApproved = approved.find(item => item.id === id);
    if (foundApproved) return foundApproved;

    const pending = readJSON(PENDING_FILE, []);
    return pending.find(item => item.id === id) || null;
  },

  // Approve a pending news item (with optional edits)
  approveArticle(id, overrides = {}) {
    const pending = readJSON(PENDING_FILE, []);
    const index = pending.findIndex(item => item.id === id);
    if (index === -1) {
      // Check if it was already approved and we're just editing it
      const approved = readJSON(APPROVED_FILE, []);
      const approvedIndex = approved.findIndex(item => item.id === id);
      if (approvedIndex !== -1) {
        approved[approvedIndex] = {
          ...approved[approvedIndex],
          ...overrides,
          updatedAt: new Date().toISOString()
        };
        writeJSON(APPROVED_FILE, approved);
        return approved[approvedIndex];
      }
      return null;
    }

    const [item] = pending.splice(index, 1);
    const approvedItem = {
      ...item,
      ...overrides,
      status: 'approved',
      approvedAt: new Date().toISOString()
    };

    const approved = readJSON(APPROVED_FILE, []);
    approved.unshift(approvedItem);

    writeJSON(PENDING_FILE, pending);
    writeJSON(APPROVED_FILE, approved);
    return approvedItem;
  },

  // Reject a news item
  rejectArticle(id) {
    const pending = readJSON(PENDING_FILE, []);
    const index = pending.findIndex(item => item.id === id);
    if (index === -1) return null;

    const [item] = pending.splice(index, 1);
    item.status = 'rejected';
    item.rejectedAt = new Date().toISOString();

    const rejected = readJSON(REJECTED_FILE, []);
    rejected.unshift(item);

    writeJSON(PENDING_FILE, pending);
    writeJSON(REJECTED_FILE, rejected);
    return item;
  },

  // Bulk Approve
  bulkApprove(ids = []) {
    if (!ids || !ids.length) return 0;
    const pending = readJSON(PENDING_FILE, []);
    const approved = readJSON(APPROVED_FILE, []);
    const idSet = new Set(ids);

    const remainingPending = [];
    const newlyApproved = [];

    for (const item of pending) {
      if (idSet.has(item.id)) {
        newlyApproved.push({
          ...item,
          status: 'approved',
          approvedAt: new Date().toISOString()
        });
      } else {
        remainingPending.push(item);
      }
    }

    approved.unshift(...newlyApproved);
    writeJSON(PENDING_FILE, remainingPending);
    writeJSON(APPROVED_FILE, approved);
    return newlyApproved.length;
  },

  // Bulk Reject
  bulkReject(ids = []) {
    if (!ids || !ids.length) return 0;
    const pending = readJSON(PENDING_FILE, []);
    const rejected = readJSON(REJECTED_FILE, []);
    const idSet = new Set(ids);

    const remainingPending = [];
    const newlyRejected = [];

    for (const item of pending) {
      if (idSet.has(item.id)) {
        newlyRejected.push({
          ...item,
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        });
      } else {
        remainingPending.push(item);
      }
    }

    rejected.unshift(...newlyRejected);
    writeJSON(PENDING_FILE, remainingPending);
    writeJSON(REJECTED_FILE, rejected);
    return newlyRejected.length;
  },

  // Create manual news written by admin
  createManualArticle(data) {
    const approved = readJSON(APPROVED_FILE, []);
    const newsItem = {
      id: 'manual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: data.title ? data.title.trim() : 'विशेष समाचार',
      description: data.description ? data.description.trim() : '',
      content: data.content || data.description || '',
      category: data.category || 'हरियाणा',
      state: data.state || 'हरियाणा',
      district: data.district || 'पानीपत',
      source: data.source || 'वार्ताप्राइम एक्सक्लूसिव',
      sourceType: 'manual',
      reporterName: data.reporterName || '',
      link: data.link || '#',
      imageurl: data.imageurl || '',
      publishedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      status: 'approved',
      isBreaking: !!data.isBreaking,
      isHero: !!data.isHero,
      isRewritten: true,
      views: 0
    };

    approved.unshift(newsItem);
    writeJSON(APPROVED_FILE, approved);
    return newsItem;
  },

  // Delete an article (from approved or pending)
  deleteArticle(id) {
    const approved = readJSON(APPROVED_FILE, []);
    const appIdx = approved.findIndex(item => item.id === id);
    if (appIdx !== -1) {
      approved.splice(appIdx, 1);
      writeJSON(APPROVED_FILE, approved);
      return true;
    }

    const pending = readJSON(PENDING_FILE, []);
    const penIdx = pending.findIndex(item => item.id === id);
    if (penIdx !== -1) {
      pending.splice(penIdx, 1);
      writeJSON(PENDING_FILE, pending);
      return true;
    }

    return false;
  },

  // Toggle Breaking status
  toggleBreaking(id) {
    const approved = readJSON(APPROVED_FILE, []);
    const item = approved.find(i => i.id === id);
    if (item) {
      item.isBreaking = !item.isBreaking;
      writeJSON(APPROVED_FILE, approved);
      return item;
    }
    return null;
  },

  // Toggle Hero/Lead status
  toggleHero(id) {
    const approved = readJSON(APPROVED_FILE, []);
    const item = approved.find(i => i.id === id);
    if (item) {
      // remove isHero from others if setting this one to hero
      const nextState = !item.isHero;
      if (nextState) {
        approved.forEach(i => i.isHero = false);
      }
      item.isHero = nextState;
      writeJSON(APPROVED_FILE, approved);
      return item;
    }
    return null;
  },

  // Increments views on article read
  incrementViews(id) {
    const approved = readJSON(APPROVED_FILE, []);
    const item = approved.find(i => i.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      writeJSON(APPROVED_FILE, approved);
      return item.views;
    }
    return 0;
  },

  // RSS Feeds Management
  getFeeds() {
    return readJSON(FEEDS_FILE, defaultFeeds);
  },

  saveFeed(feed) {
    const feeds = readJSON(FEEDS_FILE, defaultFeeds);
    if (!feed.id) {
      feed.id = 'feed_' + Date.now();
      feed.enabled = true;
      feeds.push(feed);
    } else {
      const idx = feeds.findIndex(f => f.id === feed.id);
      if (idx !== -1) {
        feeds[idx] = { ...feeds[idx], ...feed };
      } else {
        feeds.push(feed);
      }
    }
    writeJSON(FEEDS_FILE, feeds);
    return feed;
  },

  deleteFeed(feedId) {
    const feeds = readJSON(FEEDS_FILE, defaultFeeds);
    const filtered = feeds.filter(f => f.id !== feedId);
    writeJSON(FEEDS_FILE, filtered);
    return true;
  },

  toggleFeed(feedId) {
    const feeds = readJSON(FEEDS_FILE, defaultFeeds);
    const feed = feeds.find(f => f.id === feedId);
    if (feed) {
      feed.enabled = !feed.enabled;
      writeJSON(FEEDS_FILE, feeds);
      return feed;
    }
    return null;
  },

  // Stats
  getStats() {
    const pending = readJSON(PENDING_FILE, []);
    const approved = readJSON(APPROVED_FILE, []);
    const rejected = readJSON(REJECTED_FILE, []);
    const feeds = readJSON(FEEDS_FILE, defaultFeeds);
    const stats = readJSON(STATS_FILE, {});

    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      activeFeedsCount: feeds.filter(f => f.enabled).length,
      totalFeedsCount: feeds.length,
      lastFetchTime: stats.lastFetchTime,
      lastFetchStatus: stats.lastFetchStatus,
      nextFetchTime: stats.nextFetchTime,
      autoApproveEnabled: !!stats.autoApproveEnabled
    };
  },

  // Batch update all articles with high-precision semantic matching images
  fixAllArticleImages(matcherFn) {
    if (typeof matcherFn !== 'function') return { updatedApproved: 0, updatedPending: 0 };
    
    const approved = readJSON(APPROVED_FILE, []);
    let updatedApproved = 0;
    for (const item of approved) {
      if (!item.imageurl || item.imageurl.includes('unsplash.com') || item.imageurl.includes('googleusercontent.com')) {
        const newImg = matcherFn(item.title, item.category);
        if (newImg && newImg !== item.imageurl) {
          item.imageurl = newImg;
          updatedApproved++;
        }
      }
    }
    if (updatedApproved > 0) writeJSON(APPROVED_FILE, approved);

    const pending = readJSON(PENDING_FILE, []);
    let updatedPending = 0;
    for (const item of pending) {
      if (!item.imageurl || item.imageurl.includes('unsplash.com') || item.imageurl.includes('googleusercontent.com')) {
        const newImg = matcherFn(item.title, item.category);
        if (newImg && newImg !== item.imageurl) {
          item.imageurl = newImg;
          updatedPending++;
        }
      }
    }
    if (updatedPending > 0) writeJSON(PENDING_FILE, pending);

    return { updatedApproved, updatedPending };
  },

  updateStats(patch) {
    const stats = readJSON(STATS_FILE, {});
    const updated = { ...stats, ...patch };
    writeJSON(STATS_FILE, updated);
    return updated;
  }
};

db.init();

module.exports = db;
