// ==========================================================================
// VartaPrimeNews - Main Express Server & REST API
// ==========================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');
const { initScheduler, triggerNow } = require('./services/scheduler');
const { rewriteTitle, rewriteContent, rewriteArticle } = require('./services/rewriter');
const { getHaryanaWeather, getPanipatWeather } = require('./services/weatherService');
const { HARYANA_DISTRICTS, STATES_DATA } = require('./services/locations');
const { getContextualInternetImage, internetTopicPhotos } = require('./services/rssFetcher');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buffer) => { req.rawBody = buffer; }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

function panelGuard(role) {
  return (req, res, next) => {
    const expectedUser = role === 'admin' ? (process.env.ADMIN_USERNAME || 'admin') : (process.env.REPORTER_USERNAME || 'reporter');
    const expectedPass = role === 'admin' ? process.env.ADMIN_PASSWORD : process.env.REPORTER_PASSWORD;
    // Local/demo installs remain usable; production should set both passwords.
    if (!expectedPass) return next();
    const encoded = (req.headers.authorization || '').replace(/^Basic\s+/i, '');
    let supplied = '';
    try { supplied = Buffer.from(encoded, 'base64').toString('utf8'); } catch (_) {}
    if (supplied === `${expectedUser}:${expectedPass}`) return next();
    res.set('WWW-Authenticate', `Basic realm="VartaPrimeNews ${role}"`);
    return res.status(401).send('इस पैनल के लिए अधिकृत लॉगिन आवश्यक है।');
  };
}

app.use(['/admin', '/admin.html', '/api/admin'], panelGuard('admin'));
app.use(['/reporter', '/reporter.html'], panelGuard('reporter'));
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------------------------------
// PUBLIC NEWS & WEATHER API ROUTES
// --------------------------------------------------------------------------

// GET /api/weather/panipat - Live Panipat Weather for Top Bar
app.get('/api/weather/panipat', async (req, res) => {
  try {
    const weather = await getPanipatWeather();
    res.json({ success: true, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/weather/haryana - Live Weather for all 22 Haryana Districts (Sidebar)
app.get('/api/weather/haryana', async (req, res) => {
  try {
    const weather = await getHaryanaWeather();
    res.json({ success: true, count: weather.length, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/news - List approved news (optional category, search, district, state, limit)
app.get('/api/news', (req, res) => {
  try {
    const { category, search, district, state, limit } = req.query;
    const news = db.getApproved({ category, search, district, state, limit });
    res.json({ success: true, count: news.length, data: news });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/breaking - List breaking news items for ticker
app.get('/api/breaking', (req, res) => {
  try {
    const all = db.getApproved();
    const breaking = all.filter(item => item.isBreaking);
    // If no explicit breaking, fallback to latest 5 approved news
    const list = breaking.length > 0 ? breaking : all.slice(0, 6);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/news/:id - Single news detail with view counter
app.get('/api/news/:id', (req, res) => {
  try {
    const article = db.getById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'समाचार नहीं मिला।' });
    }
    if (article.status === 'approved') {
      db.incrementViews(req.params.id);
    }
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/categories and /api/counts - Category stats for navigation badges
app.get(['/api/categories', '/api/counts'], (req, res) => {
  try {
    const approved = db.getApproved();
    const counts = {};
    for (const item of approved) {
      const cat = item.category || 'अन्य';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    res.json({ success: true, counts, total: approved.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// ADMIN / APPROVAL WORKFLOW API ROUTES
// --------------------------------------------------------------------------

// GET /api/admin/pending - Get pending news queue
app.get('/api/admin/pending', (req, res) => {
  try {
    const { category, search, district, state } = req.query;
    const pending = db.getPending({ category, search, district, state });
    res.json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/approved - Get approved news for admin management
app.get('/api/admin/approved', (req, res) => {
  try {
    const { category, search, district, state } = req.query;
    const approved = db.getApproved({ category, search, district, state });
    res.json({ success: true, count: approved.length, data: approved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/approve/:id - Approve a pending news item (with optional edits)
app.post('/api/admin/approve/:id', (req, res) => {
  try {
    const { title, description, content, category, imageurl, isBreaking, isHero } = req.body;
    const overrides = {};
    if (title !== undefined) overrides.title = title;
    if (description !== undefined) overrides.description = description;
    if (content !== undefined) overrides.content = content;
    if (category !== undefined) overrides.category = category;
    if (imageurl !== undefined) overrides.imageurl = imageurl;
    if (isBreaking !== undefined) overrides.isBreaking = isBreaking;
    if (isHero !== undefined) overrides.isHero = isHero;

    const approved = db.approveArticle(req.params.id, overrides);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'समाचार नहीं मिला।' });
    }
    distributeTopNews(approved).then(result => console.log('[Distribution]', result));
    res.json({ success: true, message: 'समाचार सफलतापूर्वक स्वीकृत व लाइव किया गया!', data: approved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/reject/:id - Reject a news item
app.post('/api/admin/reject/:id', (req, res) => {
  try {
    const rejected = db.rejectArticle(req.params.id);
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'समाचार नहीं मिला।' });
    }
    res.json({ success: true, message: 'समाचार अस्वीकृत कर दिया गया।' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/bulk-approve - Approve multiple news items at once
app.post('/api/admin/bulk-approve', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'कोई आईडी नहीं मिली।' });
    }
    const count = db.bulkApprove(ids);
    res.json({ success: true, message: `${count} समाचार सफलतापूर्वक स्वीकृत किए गए!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/bulk-reject - Reject multiple news items at once
app.post('/api/admin/bulk-reject', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'कोई आईडी नहीं मिली।' });
    }
    const count = db.bulkReject(ids);
    res.json({ success: true, message: `${count} समाचार अस्वीकृत किए गए!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/create - Add custom manual news
app.post('/api/admin/create', (req, res) => {
  try {
    const { title, description, content, category, source, imageurl, link, isBreaking, isHero } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'समाचार शीर्षक अनिवार्य है।' });
    }
    const created = db.createManualArticle({
      title, description, content, category, source, imageurl, link, isBreaking, isHero
    });
    res.json({ success: true, message: 'नया समाचार प्रकाशित हो गया!', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/news/:id - Edit news with photo edit/remove authority
app.put('/api/admin/news/:id', (req, res) => {
  try {
    const { title, description, content, category, district, state, imageurl, isBreaking, isHero } = req.body;
    const overrides = {};
    if (title !== undefined) overrides.title = title;
    if (description !== undefined) overrides.description = description;
    if (content !== undefined) overrides.content = content;
    if (category !== undefined) overrides.category = category;
    if (district !== undefined) overrides.district = district;
    if (state !== undefined) overrides.state = state;
    if (imageurl !== undefined) overrides.imageurl = imageurl; // Can be null or empty string to remove
    if (isBreaking !== undefined) overrides.isBreaking = isBreaking;
    if (isHero !== undefined) overrides.isHero = isHero;

    const updated = db.approveArticle(req.params.id, overrides);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'समाचार नहीं मिला।' });
    }
    res.json({ success: true, message: 'समाचार व तस्वीर विवरण सफलतापूर्वक अपडेट हो गया!', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/upload-image - Upload image directly
app.post('/api/admin/upload-image', (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData || !imageData.startsWith('data:image')) {
      return res.status(400).json({ success: false, message: 'अमान्य इमेज डेटा।' });
    }
    const fs = require('fs');
    const crypto = require('crypto');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const matches = imageData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'इमेज पार्स करने में त्रुटि।' });
    }
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const fileName = `admin_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, fileName), matches[2], 'base64');

    res.json({ success: true, url: `/uploads/${fileName}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/news/:id - Delete an article completely
app.delete('/api/admin/news/:id', (req, res) => {
  try {
    const deleted = db.deleteArticle(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'समाचार नहीं मिला।' });
    }
    res.json({ success: true, message: 'समाचार हटा दिया गया।' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/toggle-breaking/:id
app.post('/api/admin/toggle-breaking/:id', (req, res) => {
  try {
    const updated = db.toggleBreaking(req.params.id);
    if (!updated) return res.status(404).json({ success: false, message: 'नहीं मिला।' });
    res.json({ success: true, isBreaking: updated.isBreaking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/toggle-hero/:id
app.post('/api/admin/toggle-hero/:id', (req, res) => {
  try {
    const updated = db.toggleHero(req.params.id);
    if (!updated) return res.status(404).json({ success: false, message: 'नहीं मिला।' });
    res.json({ success: true, isHero: updated.isHero });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/integrations', (req, res) => {
  res.json({ success: true, data: integrationStatus() });
});

// POST /api/admin/fetch-now - Trigger immediate RSS ingestion
app.post('/api/admin/fetch-now', async (req, res) => {
  try {
    const result = await triggerNow();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/rewrite - Paraphrase / Rewrite custom or existing article
app.post('/api/admin/rewrite', (req, res) => {
  try {
    const { title, description, content, source, category } = req.body;
    const rewritten = rewriteArticle({ title, description, content, source, category });
    res.json({ success: true, data: rewritten });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/match-image - Get high-precision semantic image for headline
app.post('/api/admin/match-image', (req, res) => {
  try {
    const { title, category } = req.body;
    const imageUrl = getContextualInternetImage(title, category);
    res.json({ success: true, imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/topic-photos - List all specialized photo pools
app.get('/api/admin/topic-photos', (req, res) => {
  res.json({ success: true, data: internetTopicPhotos });
});

// POST /api/admin/fix-all-images - Re-scan and fix all mismatched generic images across DB
app.post('/api/admin/fix-all-images', (req, res) => {
  try {
    const results = db.fixAllArticleImages((title, category) => getContextualInternetImage(title, category));
    res.json({ 
      success: true, 
      message: `सफलतापूर्वक ${results.updatedApproved} लाइव और ${results.updatedPending} लंबित समाचारों की तस्वीरें सटीक विषय अनुसार अपडेट कर दी गईं!`,
      data: results 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/stats - System stats & countdown info
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/auto-approve - Toggle auto-approve
app.post('/api/admin/auto-approve', (req, res) => {
  try {
    const { enabled } = req.body;
    const updated = db.updateStats({ autoApproveEnabled: !!enabled });
    res.json({ success: true, autoApproveEnabled: updated.autoApproveEnabled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RSS Feeds CRUD
app.get('/api/admin/feeds', (req, res) => {
  try {
    const feeds = db.getFeeds();
    res.json({ success: true, data: feeds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/feeds', (req, res) => {
  try {
    const { name, category, url, id } = req.body;
    if (!name || !category || !url) {
      return res.status(400).json({ success: false, message: 'सभी फील्ड अनिवार्य हैं।' });
    }
    const saved = db.saveFeed({ id, name, category, url });
    res.json({ success: true, message: 'RSS फीड सुरक्षित हो गई!', data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/feeds/:id', (req, res) => {
  try {
    db.deleteFeed(req.params.id);
    res.json({ success: true, message: 'RSS फीड हटा दी गई।' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/feeds/toggle/:id', (req, res) => {
  try {
    const toggled = db.toggleFeed(req.params.id);
    res.json({ success: true, data: toggled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/locations - List all States and Districts
app.get('/api/locations', (req, res) => {
  res.json({
    success: true,
    haryanaDistricts: HARYANA_DISTRICTS,
    statesData: STATES_DATA
  });
});

// POST /api/reporter/submit - District field reporter news submission endpoint
app.post('/api/reporter/submit', (req, res) => {
  try {
    const { title, description, content, category, state, district, reporterName, reporterPhone, imageurl, isBreaking } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'शीर्षक अनिवार्य है।' });
    }
    const item = db.addReporterSubmission({
      title,
      description,
      content,
      category: category || 'हरियाणा',
      state: state || 'हरियाणा',
      district: district || 'पानीपत',
      reporterName: reporterName || 'ग्राउंड रिपोर्टर',
      reporterPhone: reporterPhone || '',
      imageurl,
      isBreaking: !!isBreaking
    });
    res.json({ success: true, message: 'समाचार सफलतापूर्वक संपादकीय टीम को भेज दिया गया है!', data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Citizen reporters always enter the pending review queue and can never publish.
app.post('/api/citizen/submit', (req, res) => {
  try {
    const { title, description, content, category, state, district, reporterName, reporterPhone, imageurl, consent } = req.body;
    if (!title || !content || !reporterName || !consent) {
      return res.status(400).json({ success: false, message: 'नाम, शीर्षक, पूरी खबर और घोषणा अनिवार्य हैं।' });
    }
    if (String(title).length > 180 || String(content).length > 8000) {
      return res.status(400).json({ success: false, message: 'खबर निर्धारित सीमा से अधिक लंबी है।' });
    }
    const item = db.addReporterSubmission({
      title, description, content, category, state, district, reporterName,
      reporterPhone, imageurl, isBreaking: false,
      sourceType: 'citizen_reporter', submissionPlatform: 'web'
    });
    res.json({ success: true, message: 'आपकी नागरिक रिपोर्ट संपादकीय जाँच के लिए सुरक्षित हो गई है।', data: { id: item.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'रिपोर्ट भेजने में तकनीकी समस्या आई।' });
  }
});

// Reporter AI Bot Webhooks & Submit
app.use('/api/reporter', require('./routes/reporterBot'));

// Fallback HTML routing
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/reporter', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reporter.html'));
});

app.get('/reporter-bot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reporter-bot.html'));
});

app.get('/citizen-reporter', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'citizen-reporter.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🗞️  VartaPrimeNews Server Live!`);
  console.log(`🌐 Public Portal:   http://localhost:${PORT}`);
  console.log(`🛡️  Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`========================================================`);
  
  // Initialize Cron Scheduler
  initScheduler();
});
