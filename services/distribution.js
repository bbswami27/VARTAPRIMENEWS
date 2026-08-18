// VartaPrimeNews distribution bridge: GitPit, Telegram and WhatsApp Cloud API.
// Credentials are read only from environment variables; delivery failures never
// block editorial publishing.

function articleUrl(article) {
  const base = (process.env.PUBLIC_SITE_URL || 'https://vartaprimenews.onrender.com').replace(/\/$/, '');
  return `${base}/?news=${encodeURIComponent(article.id)}`;
}

function flashPayload(article) {
  return {
    event: 'vartaprime.top_news',
    id: article.id,
    title: article.title,
    summary: article.description || '',
    category: article.category || 'समाचार',
    imageUrl: article.imageurl || '',
    articleUrl: articleUrl(article),
    breaking: !!article.isBreaking,
    publishedAt: article.approvedAt || article.publishedAt || new Date().toISOString()
  };
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function sendToGitPit(article) {
  if (!process.env.GITPIT_NEWS_WEBHOOK_URL || !process.env.GITPIT_NEWS_SECRET) return 'not_configured';
  await postJson(process.env.GITPIT_NEWS_WEBHOOK_URL, flashPayload(article), {
    'x-vartaprime-secret': process.env.GITPIT_NEWS_SECRET
  });
  return 'sent';
}

async function sendToTelegram(article) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_NEWS_CHAT_ID;
  if (!token || !chatId) return 'not_configured';
  const message = `⚡ <b>${article.isBreaking ? 'ब्रेकिंग न्यूज़' : 'टॉप न्यूज़'}</b>\n\n<b>${article.title}</b>\n\n${article.description || ''}\n\n<a href="${articleUrl(article)}">पूरी खबर पढ़ें</a>`;
  await postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: false
  });
  return 'sent';
}

async function sendToWhatsApp(article) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_NEWS_RECIPIENT;
  if (!token || !phoneId || !recipient) return 'not_configured';
  const text = `⚡ ${article.isBreaking ? 'ब्रेकिंग न्यूज़' : 'टॉप न्यूज़'}\n\n${article.title}\n\n${article.description || ''}\n\nपूरी खबर: ${articleUrl(article)}`;
  await postJson(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'text',
    text: { body: text, preview_url: true }
  }, { authorization: `Bearer ${token}` });
  return 'sent';
}

async function distributeTopNews(article) {
  if (!article || (!article.isBreaking && !article.isHero)) return { skipped: true };
  const jobs = { gitpit: sendToGitPit(article), telegram: sendToTelegram(article), whatsapp: sendToWhatsApp(article) };
  const result = {};
  await Promise.all(Object.entries(jobs).map(async ([name, job]) => {
    try { result[name] = await job; }
    catch (error) { result[name] = `failed: ${error.message}`; }
  }));
  return result;
}

function integrationStatus() {
  return {
    gitpit: !!(process.env.GITPIT_NEWS_WEBHOOK_URL && process.env.GITPIT_NEWS_SECRET),
    telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_NEWS_CHAT_ID),
    whatsapp: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_NEWS_RECIPIENT)
  };
}

module.exports = { distributeTopNews, integrationStatus, flashPayload };
