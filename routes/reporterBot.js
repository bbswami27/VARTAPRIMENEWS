// ==========================================================================
// VartaPrime News - WhatsApp & Telegram Reporter AI Agent & Webhooks
// Allows reporters to submit live news + photos directly to Admin Pending Queue
// ==========================================================================

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../db/database');
const { translateToHindi, hasEnglishLetters } = require('../services/translator');
const { cleanRawText, rewriteTitle } = require('../services/rewriter');

// Ensure uploads dir exists for reporter photos
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 1. Direct Bot Submit Endpoint (Used by Web App Simulator & Bots)
router.post('/bot-submit', async (req, res) => {
  try {
    const {
      reporterName,
      reporterPhone,
      platform,
      channel,
      district,
      category,
      headline,
      title,
      newsText,
      content,
      imageData,
      imageurl,
      image,
      isBreaking
    } = req.body;

    const rawHeadline = headline || title;
    const rawNewsText = newsText || content;

    if (!rawHeadline || !rawNewsText) {
      return res.status(400).json({
        success: false,
        message: 'समाचार शीर्षक (Headline) और समाचार विवरण (News Text) अनिवार्य हैं।'
      });
    }

    let finalImageUrl = '';
    const imgParam = imageData || imageurl || image;

    // Handle Base64 Uploaded Photo
    if (imgParam && imgParam.startsWith('data:image')) {
      const matches = imgParam.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const fileName = `reporter_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, base64Data, 'base64');
        finalImageUrl = `/uploads/${fileName}`;
      }
    } else if (imgParam && imgParam.startsWith('http')) {
      finalImageUrl = imgParam;
    }

    // Clean & ensure pure Hindi
    let cleanTitle = rewriteTitle(headline);
    if (hasEnglishLetters(cleanTitle)) {
      cleanTitle = translateToHindi(cleanTitle);
    }

    let cleanContent = cleanRawText(newsText);
    if (hasEnglishLetters(cleanContent)) {
      cleanContent = translateToHindi(cleanContent);
    }

    const platName = platform === 'telegram' ? 'Telegram' : 'WhatsApp';
    const repName = reporterName || 'स्थानीय संवाददाता';
    const repDist = district || 'हरियाणा';
    const repCat = category || 'हरियाणा';

    // Save directly to pending queue in database using addReporterSubmission
    const savedItem = db.addReporterSubmission({
      title: cleanTitle,
      description: cleanContent.slice(0, 240),
      content: `${cleanContent}\n\n(स्रोत: ${repName} • ${platName} संवाददाता, ${repDist})`,
      category: repCat,
      state: 'हरियाणा',
      district: repDist,
      reporterName: repName,
      reporterPhone: reporterPhone || '',
      source: `${repName} (${platName})`,
      sourceType: `${platform || 'whatsapp'}_reporter`,
      imageurl: finalImageUrl || '',
      isBreaking: !!isBreaking
    });

    return res.json({
      success: true,
      message: `✅ आपकी खबर वार्ताप्राइम एडमिन पैनल में अप्रूवल के लिए सफलतापूर्वक दर्ज कर दी गई है!`,
      data: {
        id: savedItem.id,
        title: cleanTitle,
        reporter: repName,
        district: repDist,
        platform: platName,
        hasImage: !!finalImageUrl
      }
    });

  } catch (err) {
    console.error('[Reporter Bot Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'समाचार दर्ज करने में तकनीकी त्रुटि: ' + err.message
    });
  }
});

// 2. Telegram Bot Webhook Endpoint
router.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    if (!update || !update.message) {
      return res.sendStatus(200);
    }

    const msg = update.message;
    const fromUser = msg.from ? `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() : 'Telegram Reporter';
    const text = msg.text || msg.caption || '';

    if (!text || text.startsWith('/start') || text.startsWith('/help')) {
      // Return welcome info
      return res.json({
        method: 'sendMessage',
        chat_id: msg.chat.id,
        text: `🙏 वार्ताप्राइम न्यूज़ रिपोर्टर बॉट में आपका स्वागत है!\n\nअपनी खबर और तस्वीर यहाँ भेजें। प्रारूप:\n[जिला]: [शीर्षक]\n[विस्तृत खबर]`,
        parse_mode: 'HTML'
      });
    }

    // Extract title & body
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let title = lines[0] || 'ताज़ा स्थानीय खबर';
    let body = lines.slice(1).join('\n\n') || lines[0];

    let district = 'हरियाणा';
    if (title.includes(':')) {
      const p = title.split(':');
      district = p[0].trim();
      title = p[1].trim();
    }

    const newsId = `tg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const cleanTitle = translateToHindi(title);
    const cleanBody = translateToHindi(body);

    const newArticle = {
      id: newsId,
      title: cleanTitle,
      description: cleanBody.slice(0, 240),
      content: `${cleanBody}\n\n(स्रोत: ${fromUser} • Telegram संवाददाता, ${district})`,
      category: 'हरियाणा',
      state: 'हरियाणा',
      district: district,
      source: `${fromUser} (Telegram)`,
      sourceType: 'telegram_reporter',
      reporterName: fromUser,
      imageurl: null,
      publishedAt: new Date().toISOString(),
      status: 'pending',
      isBreaking: false,
      isHero: false,
      isRewritten: true,
      views: 0
    };

    db.addPending([newArticle]);

    return res.json({
      method: 'sendMessage',
      chat_id: msg.chat.id,
      text: `✅ <b>खबर प्राप्त हुई!</b>\n\nशीर्षक: ${cleanTitle}\nजिला: ${district}\nस्थिति: एडमिन रिव्यू के लिए सुरक्षित कर दी गई है।`,
      parse_mode: 'HTML'
    });

  } catch (err) {
    console.error('[Telegram Webhook Error]:', err);
    return res.sendStatus(200);
  }
});

// 3. WhatsApp Webhook Endpoint
router.post('/whatsapp-webhook', async (req, res) => {
  try {
    const data = req.body;
    const sender = data.From || data.sender || 'WhatsApp Reporter';
    const text = data.Body || data.text || '';

    if (text) {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const title = translateToHindi(lines[0] || 'व्हाट्सएप से ताज़ा रिपोर्ट');
      const body = translateToHindi(lines.slice(1).join('\n\n') || lines[0]);

      const newsId = `wa_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const newArticle = {
        id: newsId,
        title: title,
        description: body.slice(0, 240),
        content: `${body}\n\n(स्रोत: WhatsApp संवाददाता • ${sender})`,
        category: 'हरियाणा',
        state: 'हरियाणा',
        district: 'हरियाणा',
        source: `WhatsApp (${sender})`,
        sourceType: 'whatsapp_reporter',
        reporterName: sender,
        imageurl: null,
        publishedAt: new Date().toISOString(),
        status: 'pending',
        isBreaking: false,
        isHero: false,
        isRewritten: true,
        views: 0
      };

      db.addPending([newArticle]);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[WhatsApp Webhook Error]:', err);
    return res.sendStatus(200);
  }
});

// 4. Status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    platform: 'VartaPrime Reporter Bot System Active',
    endpoints: {
      submit: '/api/reporter/bot-submit',
      telegramWebhook: '/api/reporter/telegram-webhook',
      whatsappWebhook: '/api/reporter/whatsapp-webhook'
    }
  });
});

module.exports = router;
