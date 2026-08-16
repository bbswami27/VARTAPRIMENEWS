// ==========================================================================
// VartaPrime News - Authentic Source News Cleaner & 100% Pure Hindi Engine
// NO AI Synthetic generation - Preserves 100% authentic news from source
// ==========================================================================

const { translateToHindi, fixCorruptedHindiWords, hasEnglishLetters } = require('./translator');

const structuralTransforms = [
  { pattern: /(अमर उजाला ब्यूरो|दैनिक जागरण|आजतक ब्यूरो|एनडीटीवी खबर|नवभारत टाइम्स|बीबीसी हिंदी|एबीपी न्यूज|हिंदुस्तान संवाददाता|पीटीआई|भाषा|वार्ता|न्यूज एजेंसी)/gi, replace: '' },
  { pattern: /(पूरी खबर पढ़ें|क्लिक करें|यहाँ देखें|ऐप पर पढ़ें|विस्तार से जानें|पूरी रिपोर्ट पढ़ें|तस्वीरों में देखें|वीडियो देखें|खबर अपडेट हो रही है|लाइव अपडेट्स|और ऐप डाउनलोड करें|ऐप डाउनलोड करें|डाउनलोड करें|सब्सक्राइब करें|फॉलो करें|शेयर करें)/gi, replace: '' },
  { pattern: /normalnormalnormal/gi, replace: '' }
];

function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function isHindiText(str) {
  if (!str) return false;
  const devanagariMatches = str.match(/[\u0900-\u097F]/g) || [];
  return devanagariMatches.length >= 10;
}

// Clean HTML tags and formatting artifacts
function cleanRawText(text) {
  if (!text) return '';
  let clean = text.replace(/<[^>]+>/g, ' ');

  // Strip repeated prefixes & boilerplate artifacts
  clean = clean.replace(/(संबंधित विषय को लेकर सामने आए विवरण के आधार पर|प्राप्त प्राथमिक रिपोर्ट और आधिकारिक जानकारी के मुताबिक|ताज़ा घटनाक्रम और प्राप्त आधिकारिक विवरण के अनुसार|संबंधित विषय को लेकर सामने आई प्राथमिक रिपोर्ट के मुताबिक|मामले के विस्तृत ब्योरे के अनुसार|घटनाक्रम से जुड़ी अन्य जानकारियों के अनुसार|प्राप्त आधिकारिक विवरण के अनुसार|प्राप्त ताज़ा जानकारी के अनुसार|प्राप्त ताज़ा जानकारी और आधिकारिक विवरण के अनुसार)[,\s:]*/g, ' ');
  clean = clean.replace(/(पर बड़ा अपडेट\s*:?\s*)+/g, ' ');
  clean = clean.replace(/(इस पूरे घटनाक्रम को लेकर संबंधित विभाग|प्रत्यक्षदर्शी आवश्यक विवरण साझा कर रहे हैं|इस पूरे प्रकरण को लेकर)[^।\n]*[।\n]?/g, ' ');
  clean = clean.replace(/normalnormalnormal/gi, ' ');
  clean = clean.replace(/\(वार्ताप्राइम विशेष रिपोर्ट[^)]+\)/g, ' ');
  clean = clean.replace(/\(स्रोत:[^)]+\)/g, ' ');
  clean = clean.replace(/> ⚠️ \*\*सत्यापन आवश्यक:[^\n]+\n*/g, ' ');

  for (const item of structuralTransforms) {
    clean = clean.replace(item.pattern, item.replace);
  }

  // Translate any English phrases to Hindi
  if (hasEnglishLetters(clean)) {
    clean = translateToHindi(clean);
  }

  clean = fixCorruptedHindiWords(clean);

  return clean.replace(/\s+/g, ' ').trim();
}

// 1. Clean & Pure Hindi Title (Zero English)
function rewriteTitle(rawTitle) {
  if (!rawTitle) return '';
  let title = rawTitle.trim();

  // Strip brand names & publishers at tail
  title = title.replace(/\s*[-–|:]\s*(दैनिक जागरण|अमर उजाला|आजतक|NDTV|BBC|ABP News|Hindustan|Navbharat Times|Zee News|Google News|News18|Patrika|Dainik Bhaskar|livemint\.com|ETV Bharat|Live Hindustan).*$/i, '');
  title = title.replace(/\s*[-–|:]\s*[A-Za-z0-9\s]+$/, '');
  title = title.replace(/(पर बड़ा अपडेट\s*:?\s*)+/g, ': ');

  for (const item of structuralTransforms) {
    title = title.replace(item.pattern, item.replace);
  }

  // Translate any English words in the title to pure Hindi
  if (hasEnglishLetters(title)) {
    title = translateToHindi(title);
  }

  title = fixCorruptedHindiWords(title);

  title = title.replace(/^[:;,\s\-]+|[:;,\s\-]+$/g, '').trim();
  return title.replace(/(सनसनीखेज|हैरान करने वाला|देखें वीडियो|जानिए क्या हुआ)/g, '').trim();
}

// 2. Format Authentic Source Content (No AI Fabrication)
function rewriteContent(rawText, sourceName = '', category = 'देश', district = '', title = '') {
  let clean = cleanRawText(rawText || '');
  let cleanTitle = rewriteTitle(title || '');

  // Split into authentic paragraphs
  const sentences = clean.split(/(?<=[।!?\n])/).map(s => s.trim()).filter(s => s.length > 5);

  let paragraphs = [];
  let currentPara = [];
  let currentWordCount = 0;

  for (const s of sentences) {
    currentPara.push(s);
    currentWordCount += s.split(/\s+/).length;
    if (currentWordCount >= 40) {
      paragraphs.push(currentPara.join(' '));
      currentPara = [];
      currentWordCount = 0;
    }
  }
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  if (paragraphs.length === 0) {
    paragraphs.push(clean || cleanTitle);
  }

  const structuredBody = paragraphs.join('\n\n');
  const attribution = `\n\n(स्रोत: ${sourceName || 'संवाद सूत्र / समाचार एजेंसी'})`;

  return structuredBody + attribution;
}

// 3. Full Article Processor
function rewriteArticle(article) {
  if (!article) return article;

  const originalTitle = article.originalTitle || article.title || '';
  const originalDescription = article.rawDescription || article.description || article.content || '';
  const sourceName = article.originalSource || article.source || 'समाचार एजेंसी';
  const category = article.category || 'देश';
  const district = article.district || '';

  const newTitle = rewriteTitle(originalTitle);
  const newContent = rewriteContent(originalDescription, sourceName, category, district, newTitle || originalTitle);

  const cleanBodyOnly = newContent.split('\n\n')[0] || '';
  const summary = cleanBodyOnly.slice(0, 240);

  return {
    ...article,
    title: newTitle || originalTitle,
    description: summary,
    content: newContent,
    isRewritten: true,
    originalTitle: originalTitle,
    originalSource: sourceName
  };
}

module.exports = {
  rewriteTitle,
  rewriteContent,
  rewriteArticle,
  countWords,
  isHindiText,
  cleanRawText,
  translateToHindi
};
