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
  // 1. Accidents, Highway Collisions, Emergency & Fires
  accident: [
    'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=80'
  ],

  // 2. Police, Arrests, Crime Scene & Raids
  crime_police: [
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=800&auto=format&fit=crop&q=80'
  ],

  // 3. Court, Judiciary, Supreme Court, High Court & Legal
  court_legal: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&auto=format&fit=crop&q=80'
  ],

  // 4. Rain, Monsoon, Floods, Yamuna & Weather Alerts
  weather_flood: [
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486016006115-74a41448aea2?w=800&auto=format&fit=crop&q=80'
  ],

  // 5. Gold, Silver, Jewellery & Precious Metals
  gold_silver: [
    'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80'
  ],

  // 6. Stock Market, Sensex, Nifty, Banking & Economy
  stock_market: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80'
  ],

  // 7. Education, Board Results, 10th/12th, NEET, JEE & Students
  education_results: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80'
  ],

  // 8. Jobs, Government Recruitment, Vacancies, HSSC, CET & UPSC
  jobs_career: [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  ],

  // 9. Cricket, IPL, Wrestling, Athletics & Sports
  cricket_sports: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80'
  ],

  // 10. Cinema, Bollywood, Movies, Actors & Entertainment
  cinema_entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=80'
  ],

  // 11. Wedding, Marriage & Lifestyle
  wedding_lifestyle: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
  ],

  // 12. Agriculture, Farmers, Mandi & Crops
  farming_agriculture: [
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
  ],

  // 13. Health, Hospitals, Doctors, Medicine & Healthcare
  health_hospital: [
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
  ],

  // 14. Temples, Pilgrimage, Spirituality & Festivals
  temple_spiritual: [
    'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
  ],

  // 15. Youth, Innovation, Startups & Technology
  youth_tech: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
  ],

  // 16. Politics, Elections, Ministers & Government
  politics_government: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&auto=format&fit=crop&q=80'
  ],

  // 17. International, Diplomacy & World
  international_world: [
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
  ],

  // 18. City Infrastructure, Highways & Urban Haryana (Fallback)
  haryana_city_infrastructure: [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80'
  ]
};

// High-precision Priority-based Keyword Mapping
// Specific news topics ALWAYS take strict precedence over generic city/state names!
const keywordMap = [
  // 1. Accidents, Highway collisions, Fire, Emergency (Highest Priority)
  { 
    match: /(हादसा|दुर्घटना|टक्कर|पलटी|घायल|सड़क हादसा|सड़क दुर्घटना|बस हादसा|ट्रक|कार हादसा|डंपर|टैंकर|ट्रेन हादसा|रेल हादसा|ऑटो पलटा|खाई में गिरी|धमाका|आग लगी|भीषण आग|सिलेंडर ब्लास्ट|करंट लगा|डूबने से मौत)/i, 
    pool: 'accident' 
  },

  // 2. Crime, Police Arrest, Theft, Gangster, Murder, Drug Trafficking
  { 
    match: /(पुलिस|गिरफ्तार|हिरासत|चोर|चोरी|डकैती|लूट|अपराध|अपराधी|बदमाश|गैंगस्टर|हथियार|तमंचा|पिस्तौल|गोलीबारी|फायरिंग|कत्ल|हत्या|मर्डर|शव बरामद|लाश|फिरौती|नशा|तस्कर|स्मैक|गांजा|अफीम|शराब|छापेमारी|रेड|सीआईए|थाना|एफआईआर|चालान|छेड़छाड़|दुष्कर्म)/i, 
    pool: 'crime_police' 
  },

  // 3. Court, Legal, Bail, Verdict, Supreme Court, High Court
  { 
    match: /(सुप्रीम कोर्ट|हाई कोर्ट|अदालत|जमानत|याचिका|फैसला|न्यायालय|जज|वकील|सजा सुनाई|दोषी करार|बरी|सीबीआई जांच|ईडी जांच|समन जारी)/i, 
    pool: 'court_legal' 
  },

  // 4. Gold, Silver, Bullion & Jewellery
  { 
    match: /(सोना|चांदी|गोल्ड|सिल्वर|सर्राफा|जेवर|आभूषण|24 कैरेट|22 कैरेट|सोने के भाव|चांदी के भाव|सोने की कीमत)/i, 
    pool: 'gold_silver' 
  },

  // 5. Weather, Rain, Monsoon, Floods & Storms
  { 
    match: /(मौसम|बारिश|बरसात|मानसून|जलभराव|बाढ़|यमुना का जलस्तर|आंधी|तूफान|ओलावृष्टि|बिजली गिरी|मौसम विभाग|शीतलहर|घना कोहरा|धुंध|लू का अलर्ट|AQI|प्रदूषण)/i, 
    pool: 'weather_flood' 
  },

  // 6. Education, Board Results, 10th, 12th, NEET, JEE & Students
  { 
    match: /(10वीं|12वीं|बोर्ड रिजल्ट|परीक्षा परिणाम|रिजल्ट जारी|एग्जाम|छात्र|छात्रा|टॉपर|मार्कशीट|मेरिट|नीट|NEET|जेईई|JEE|सीयूईटी|सीबीएसई|CBSE|एचबीएसई|HBSE|दाखिला|स्कूल|कॉलेज|यूनिवर्सिटी|विश्वविद्यालय|छात्रवृत्ति)/i, 
    pool: 'education_results' 
  },

  // 7. Government Jobs, Recruitment, Vacancies, HSSC, CET & UPSC
  { 
    match: /(सरकारी नौकरी|भर्ती|वैकेंसी|पदों पर भर्ती|आवेदन शुरू|अंतिम तिथि|एडमिट कार्ड जारी|इंटरव्यू|एचएसएससी|HSSC|सीईटी|CET|यूपीएससी|UPSC|एसएससी|SSC|रेलवे भर्ती|अग्निवीर|रोजगार मेला)/i, 
    pool: 'jobs_career' 
  },

  // 8. Cricket, IPL, Sports, Wrestling, Olympics, Medals
  { 
    match: /(क्रिकेट|मैच|टी20|वनडे|टेस्ट मैच|शतक|अर्धशतक|विकेट|रोहित शर्मा|विराट कोहली|धोनी|हार्दिक|बुमराह|शुभमन गिल|आईपीएल|IPL|बीसीसीआई|कुश्ती|दंगल|पहलवान|विनेश|बजरंग पुनिया|नीरज चोपड़ा|भाला फेंक|मेडल|पदक|हॉकी|फुटबॉल|बैडमिंटन|कबड्डी|स्टेडियम|खिलाड़ी)/i, 
    pool: 'cricket_sports' 
  },

  // 9. Bollywood, Cinema, Movies, Actors, Box Office
  { 
    match: /(फिल्म|सिनेमा|मूवी|ट्रेलर|बॉक्स ऑफिस|कमाई|एक्टर|एक्ट्रेस|अभिनेता|अभिनेत्री|शाहरुख|सलमान|आमिर खान|सनी देओल|अक्षय कुमार|दीपिका|आलिया|रणबीर|अल्लू अर्जुन|ऋतिक|प्रभास|गाना रिलीज|म्यूजिक|ओटीटी|वेब सीरीज|बिग बॉस|टीवी शो|सेलेब्रिटी)/i, 
    pool: 'cinema_entertainment' 
  },

  // 10. Weddings, Marriages & Lifestyle
  { 
    match: /(शादी|विवाह|दूल्हा|दुल्हन|फेरे|रिसेप्शन|मेहंदी|सगाई|वरमाला|फैशन|ब्यूटी टिप्स|लाइफस्टाइल)/i, 
    pool: 'wedding_lifestyle' 
  },

  // 11. Agriculture, Farmers, Mandi, MSP & Crops
  { 
    match: /(किसान|खेत|खेती|फसल|धान|गेहूं|सरसों|कपास|बाजरा|मंडी|आढ़ती|यूरिया|डीएपी|खाद|ट्रैक्टर|ट्यूबवेल|नहर|एमएसपी|MSP|कृषि मंत्री|कर्ज माफी|फसल बीमा)/i, 
    pool: 'farming_agriculture' 
  },

  // 12. Health, Hospitals, PGI, Doctors & Diseases
  { 
    match: /(अस्पताल|डॉक्टर|मरीज|पीजीआई|PGI|सिविल अस्पताल|सीटी स्कैन|एमआरआई|डेंगू|मलेरिया|बुखार|इलाज|ऑपरेशन|दवा|वैक्सीन|एंबुलेंस|स्वास्थ्य विभाग|बीमारी|हेल्थ|डाइट|योग)/i, 
    pool: 'health_hospital' 
  },

  // 13. Stock Market, Economy, Banking & Inflation
  { 
    match: /(शेयर बाजार|सेंसेक्स|निफ्टी|स्टॉक मार्केट|म्यूचुअल फंड|आईपीओ|बैंक|लोन|ब्याज दर|आरबीआई|रिजर्व बैंक|जीएसटी|टैक्स|बजट|महंगाई|रुपया|डॉलर|पेट्रोल|डीजल)/i, 
    pool: 'stock_market' 
  },

  // 14. Temples, Pilgrimage, Religious Festivals, Aarti & Pooja
  { 
    match: /(मंदिर|पूजा|आरती|दर्शन|तीर्थ|कावड़ यात्रा|महाकाल|अयोध्या|राम मंदिर|काशी विश्वनाथ|खाटू श्याम|सालासर|हरिद्वार|वृंदावन|मथुरा|पंचांग|राशिफल|मुहूर्त|भक्त|श्रद्धालु|त्योहार|दिवाली|होली|जन्माष्टमी|शिवरात्रि|नवरात्रि)/i, 
    pool: 'temple_spiritual' 
  },

  // 15. Youth, Startups, Innovation, AI & Tech
  { 
    match: /(स्टार्टअप|इनोवेशन|नवाचार|युवा शक्ति|उद्यमी|स्किल|कौशल|रोबोटिक्स|एआई|AI|कंप्यूटर|स्मार्टफोन|5G|टेक्नोलॉजी|सॉफ्टवेयर|इसरो|अंतरिक्ष|रॉकेट)/i, 
    pool: 'youth_tech' 
  },

  // 16. Politics, Ministers, Elections, Rallies & Government
  { 
    match: /(संसद|विधानसभा|सरकार|विपक्ष|मुख्यमंत्री|सीएम|मंत्री|प्रधानमंत्री|पीएम|मोदी|राहुल गांधी|अमित शाह|अरविंद केजरीवाल|नायब सैनी|भूपेंद्र हुड्डा|अनिल विज|चुनाव|वोट|मतदान|रैली|जनसभा|पार्टी|कांग्रेस|भाजपा|आप|इनेलो|जेजेपी|सांसद|विधायक|प्रशासन|उपायुक्त|डीसी|एसपी)/i, 
    pool: 'politics_government' 
  },

  // 17. International, Global Conflicts, Diplomacy
  { 
    match: /(अमेरिका|रूस|चीन|पाकिस्तान|यूक्रेन|इजरायल|ईरान|गाजा|ब्रिटेन|यूरोप|यूएन|संयुक्त राष्ट्र|ट्रंप|पुतिन|बाइडन|युद्ध|वैश्विक|अंतरराष्ट्रीय)/i, 
    pool: 'international_world' 
  }
];

// Helper to choose a unique, non-repeating contextual image based on title & category
function getContextualInternetImage(title, category) {
  const t = (title || '').toLowerCase();

  let selectedPool = null;

  // 1. Try high-precision topic keyword matching first
  for (const item of keywordMap) {
    if (item.match.test(t)) {
      selectedPool = item.pool;
      break;
    }
  }

  // 2. Category fallback if no specific keyword matched
  if (!selectedPool) {
    if (category === 'खेल') selectedPool = 'cricket_sports';
    else if (category === 'मनोरंजन') selectedPool = 'cinema_entertainment';
    else if (category === 'क्राइम') selectedPool = 'crime_police';
    else if (category === 'शिक्षा') selectedPool = 'education_results';
    else if (category === 'करियर') selectedPool = 'jobs_career';
    else if (category === 'स्वास्थ्य') selectedPool = 'health_hospital';
    else if (category === 'बिज़नेस') selectedPool = 'stock_market';
    else if (category === 'धर्म') selectedPool = 'temple_spiritual';
    else if (category === 'युवा') selectedPool = 'youth_tech';
    else if (category === 'राजनीति') selectedPool = 'politics_government';
    else if (category === 'विदेश') selectedPool = 'international_world';
    else if (category === 'लाइफस्टाइल') selectedPool = 'wedding_lifestyle';
    else selectedPool = 'haryana_city_infrastructure';
  }

  const pool = internetTopicPhotos[selectedPool] || internetTopicPhotos['haryana_city_infrastructure'];
  
  // Use deterministic MD5 hash of title to pick consistent distinct photo from the pool
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

// Scrape real photo and complete story body directly from publisher webpage
async function scrapeArticleFromWeb(url, fallbackSummary = '') {
  if (!url || url === '#' || url.includes('news.google.com')) {
    return { imageUrl: null, fullContent: fallbackSummary };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    clearTimeout(timeout);

    if (!res.ok) return { imageUrl: null, fullContent: fallbackSummary };
    const html = await res.text();

    // 1. Extract Real Authentic Photo from Source
    let imageUrl = null;
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i);

    if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
      const u = ogMatch[1];
      if (!u.includes('googleusercontent.com') && 
          !u.includes('analytics') && 
          !u.includes('pixel') && 
          !u.includes('logo_default') &&
          !u.includes('default_500') &&
          !u.includes('default_image') &&
          !u.includes('placeholder')) {
        imageUrl = u;
      }
    }

    // 2. Extract Complete Story Body from Article
    const stripped = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

    const paragraphs = [];
    const pMatches = stripped.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
    for (const p of pMatches) {
      let text = p[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

      const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
      if (text.length >= 35 && devanagariCount >= 15 && 
          !text.includes('सब्सक्राइब') && !text.includes('कॉपीराइट') && 
          !text.includes('डाउनलोड करें') && !text.includes('वेबसाइट पर पढ़ना जारी रखने') &&
          !text.includes('विज्ञापन')) {
        paragraphs.push(text);
      }
    }

    let fullContent = paragraphs.length > 0 ? paragraphs.join('\n\n') : '';

    if (!fullContent || fullContent.length < 50) {
      const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
      if (ogDesc && ogDesc[1] && ogDesc[1].trim().length > 30) {
        fullContent = ogDesc[1].trim();
      } else {
        fullContent = fallbackSummary;
      }
    }

    return { imageUrl, fullContent };
  } catch (e) {
    return { imageUrl: null, fullContent: fallbackSummary };
  }
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

    for (const item of parsed.items.slice(0, 20)) {
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

      // 1. Extract Real Authentic Photo from XML (if available)
      let imageUrl = extractImageFromXml(item);

      // 2. Fetch Complete News Body and Real Article Image from Source Website
      let contentText = cleanText(item.contentEncoded || item.content || description);
      if (link && !link.includes('news.google.com')) {
        const scraped = await scrapeArticleFromWeb(link, contentText || description);
        if (!imageUrl && scraped.imageUrl) {
          imageUrl = scraped.imageUrl;
        }
        if (scraped.fullContent && scraped.fullContent.length > contentText.length) {
          contentText = scraped.fullContent;
        }
      }

      // Strictly NO AI / Stock photos fallback - only genuine source photo or null
      if (imageUrl && (imageUrl.includes('unsplash.com') || imageUrl.includes('googleusercontent.com'))) {
        imageUrl = null;
      }

      const loc = detectLocation(cleanTitle, contentText, feed.category);

      const rawArticle = {
        title: cleanTitle,
        description: description || (contentText ? contentText.slice(0, 300) : ''),
        content: contentText,
        category: feed.category,
        state: loc.state,
        district: loc.district,
        source: sourceName,
        link: link,
        imageurl: imageUrl || '',
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString()
      };

      // 4. Paraphrase and Structure into Clean Journalistic Hindi
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
  getContextualInternetImage,
  internetTopicPhotos,
  keywordMap
};
