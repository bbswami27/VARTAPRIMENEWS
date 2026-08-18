// ==========================================================================
// VartaPrime News - Verified Direct RSS Feeds with Authentic News & Photos
// ==========================================================================

const defaultFeeds = [
  // ==========================================================================
  // 1. हरियाणा (Haryana - Direct Newspaper Feeds + District Feeds)
  // ==========================================================================
  {
    id: "feed-haryana-amarujala",
    name: "अमर उजाला - हरियाणा",
    category: "हरियाणा",
    url: "https://www.amarujala.com/rss/haryana.xml",
    enabled: true
  },
  {
    id: "feed-haryana-abp",
    name: "ABP Live - पंजाब व हरियाणा",
    category: "हरियाणा",
    url: "https://www.abplive.com/states/punjab-haryana/feed",
    enabled: true
  },
  {
    id: "feed-haryana-panipat",
    name: "Google News - पानीपत",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%AA%E0%A4%BE%E0%A4%A8%E0%A5%80%E0%A4%AA%E0%A4%A4+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-karnal",
    name: "Google News - करनाल",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%95%E0%A4%B0%E0%A4%A8%E0%A4%BE%E0%A4%B2+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-gurugram",
    name: "Google News - गुरुग्राम",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%97%E0%A5%81%E0%A4%B0%E0%A5%81%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%AE+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-faridabad",
    name: "Google News - फरीदाबाद",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%AB%E0%A4%B0%E0%A5%80%E0%A4%A6%E0%A4%BE%E0%A4%AC%E0%A4%BE%E0%A4%A6+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-hisar",
    name: "Google News - हिसार",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%B9%E0%A4%BF%E0%A4%B8%E0%A4%BE%E0%A4%B0+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-rohtak",
    name: "Google News - रोहतक",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%B0%E0%A5%8B%E0%A4%B9%E0%A4%A4%E0%A4%95+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-ambala",
    name: "Google News - अंबाला",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%85%E0%A4%82%E0%A4%AC%E0%A4%BE%E0%A4%B2%E0%A4%BE+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-sonipat",
    name: "Google News - सोनीपत",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%B8%E0%A5%8B%E0%A4%A8%E0%A5%80%E0%A4%AA%E0%A4%A4+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-kurukshetra",
    name: "Google News - कुरुक्षेत्र",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%95%E0%A5%81%E0%A4%B0%E0%A5%81%E0%A4%95%E0%A5%8D%E0%A4%77%E0%A5%87%E0%A4%A4%E0%A5%8D%E0%A4%B0+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-yamunanagar",
    name: "Google News - यमुनानगर",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%AF%E0%A4%AE%E0%A5%81%E0%A4%A8%E0%A4%BE%E0%A4%A8%E0%A4%97%E0%A4%B0+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-sirsa",
    name: "Google News - सिरसा",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%B8%E0%A4%BF%E0%A4%B0%E0%A4%B8%E0%A4%BE+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-bhiwani",
    name: "Google News - भिवानी",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%AD%E0%A4%BF%E0%A4%B5%E0%A4%BE%E0%A4%A8%E0%A5%80+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-jind",
    name: "Google News - जींद",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%9C%E0%A5%80%E0%A4%82%E0%A4%A6+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-haryana-rewari",
    name: "Google News - रेवाड़ी",
    category: "हरियाणा",
    url: "https://news.google.com/rss/search?q=%E0%A4%B0%E0%A5%87%E0%A4%Walk%E0%A4%BE%E0%A4%A1%E0%A4%BC%E0%A5%80+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 2. दिल्ली (Delhi-NCR Feeds)
  // ==========================================================================
  {
    id: "feed-dilli-amarujala",
    name: "अमर उजाला - दिल्ली NCR",
    category: "दिल्ली",
    url: "https://www.amarujala.com/rss/delhi-ncr.xml",
    enabled: true
  },
  {
    id: "feed-dilli-abp",
    name: "ABP Live - दिल्ली NCR",
    category: "दिल्ली",
    url: "https://www.abplive.com/states/delhi-ncr/feed",
    enabled: true
  },
  {
    id: "feed-dilli-gnews",
    name: "Google News - दिल्ली लाइव",
    category: "दिल्ली",
    url: "https://news.google.com/rss/search?q=%E0%A4%A6%E0%A4%BF%E0%A4%B2%E0%A5%8D%E0%A4%B2%E0%A5%80+when:2d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 3. देश (National Feeds)
  // ==========================================================================
  {
    id: "feed-desh-amarujala",
    name: "अमर उजाला - देश",
    category: "देश",
    url: "https://www.amarujala.com/rss/india-news.xml",
    enabled: true
  },
  {
    id: "feed-desh-aajtak",
    name: "आजतक - भारत",
    category: "देश",
    url: "https://www.aajtak.in/rssfeeds/?id=home",
    enabled: true
  },
  {
    id: "feed-desh-ndtv",
    name: "NDTV ख़बर - ताज़ा",
    category: "देश",
    url: "https://feeds.feedburner.com/ndtvkhabar-latest",
    enabled: true
  },
  {
    id: "feed-desh-bbc",
    name: "BBC News - हिंदी",
    category: "देश",
    url: "https://feeds.bbci.co.uk/hindi/rss.xml",
    enabled: true
  },
  {
    id: "feed-desh-abp",
    name: "ABP Live - देश",
    category: "देश",
    url: "https://www.abplive.com/home/feed",
    enabled: true
  },

  // ==========================================================================
  // 4. विदेश (World / International)
  // ==========================================================================
  {
    id: "feed-videsh-amarujala",
    name: "अमर उजाला - दुनिया",
    category: "विदेश",
    url: "https://www.amarujala.com/rss/world-news.xml",
    enabled: true
  },
  {
    id: "feed-videsh-abp",
    name: "ABP Live - विदेश",
    category: "विदेश",
    url: "https://www.abplive.com/world-news/feed",
    enabled: true
  },
  {
    id: "feed-videsh-gnews",
    name: "Google News - दुनिया",
    category: "विदेश",
    url: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 5. बिज़नेस व मार्केट (Business, Stocks & Commodities)
  // ==========================================================================
  {
    id: "feed-business-amarujala",
    name: "अमर उजाला - कारोबार",
    category: "बिज़नेस",
    url: "https://www.amarujala.com/rss/business-news.xml",
    enabled: true
  },
  {
    id: "feed-business-abp",
    name: "ABP Live - बिज़नेस",
    category: "बिज़नेस",
    url: "https://www.abplive.com/business/feed",
    enabled: true
  },
  {
    id: "feed-business-stock",
    name: "Google News - शेयर बाजार",
    category: "बिज़नेस",
    url: "https://news.google.com/rss/search?q=%E0%A4%B6%E0%A5%87%E0%A4%AF%E0%A4%B0+%E0%A4%AC%E0%A4%BE%E0%A4%9C%E0%A4%BE%E0%A4%B0+%E0%A4%B8%E0%A5%87%E0%A4%82%E0%A4%B8%E0%A5%87%E0%A4%95%E0%A5%8D%E0%A4%B8+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },
  {
    id: "feed-business-gold",
    name: "Google News - सोना चांदी भाव",
    category: "बिज़नेस",
    url: "https://news.google.com/rss/search?q=%E0%A4%B8%E0%A5%8B%E0%A4%A8%E0%A4%BE+%E0%A4%9A%E0%A4%BE%E0%A4%82%E0%A4%A6%E0%A5%80+%E0%A4%AD%E0%A4%BE%E0%A4%B5+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 6. खेल (Sports & Cricket)
  // ==========================================================================
  {
    id: "feed-khel-amarujala",
    name: "अमर उजाला - खेल",
    category: "खेल",
    url: "https://www.amarujala.com/rss/sports-news.xml",
    enabled: true
  },
  {
    id: "feed-khel-abp",
    name: "ABP Live - खेल",
    category: "खेल",
    url: "https://www.abplive.com/sports/feed",
    enabled: true
  },

  // ==========================================================================
  // 7. मनोरंजन व सिनेमा (Entertainment & Bollywood)
  // ==========================================================================
  {
    id: "feed-manoranjan-amarujala",
    name: "अमर उजाला - मनोरंजन",
    category: "मनोरंजन",
    url: "https://www.amarujala.com/rss/entertainment-news.xml",
    enabled: true
  },
  {
    id: "feed-manoranjan-abp",
    name: "ABP Live - मनोरंजन",
    category: "मनोरंजन",
    url: "https://www.abplive.com/entertainment/feed",
    enabled: true
  },

  // ==========================================================================
  // 8. युवा, करियर व सरकारी नौकरी (Youth, Career & Jobs)
  // ==========================================================================
  {
    id: "feed-jobs-amarujala",
    name: "अमर उजाला - सरकारी नौकरी व करियर",
    category: "करियर",
    url: "https://www.amarujala.com/rss/jobs.xml",
    enabled: true
  },
  {
    id: "feed-career-abp",
    name: "ABP Live - सरकारी नौकरी",
    category: "करियर",
    url: "https://www.abplive.com/employment/feed",
    enabled: true
  },
  {
    id: "feed-yuva-startups",
    name: "Google News - युवा व स्टार्टअप्स",
    category: "युवा",
    url: "https://news.google.com/rss/search?q=%E0%A4%AF%E0%A5%81%E0%A4%B5%E0%A4%BE+%E0%A4%B8%E0%A5%8D%E0%A4%9F%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%9F%E0%A4%85%E0%A4%AA+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 9. शिक्षा (Education)
  // ==========================================================================
  {
    id: "feed-shiksha-abp",
    name: "ABP Live - शिक्षा",
    category: "शिक्षा",
    url: "https://www.abplive.com/education/feed",
    enabled: true
  },
  {
    id: "feed-shiksha-gnews",
    name: "Google News - शिक्षा व बोर्ड रिजल्ट",
    category: "शिक्षा",
    url: "https://news.google.com/rss/search?q=%E0%A4%B6%E0%A4%BF%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+%E0%A4%AC%E0%A5%8B%E0%A4%B0%E0%A5%8D%E0%A4%A1+%E0%A4%AA%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 10. लाइफस्टाइल व स्वास्थ्य (Lifestyle & Health)
  // ==========================================================================
  {
    id: "feed-lifestyle-amarujala",
    name: "अमर उजाला - लाइफस्टाइल",
    category: "लाइफस्टाइल",
    url: "https://www.amarujala.com/rss/lifestyle.xml",
    enabled: true
  },
  {
    id: "feed-lifestyle-abp",
    name: "ABP Live - लाइफस्टाइल",
    category: "लाइफस्टाइल",
    url: "https://www.abplive.com/lifestyle/feed",
    enabled: true
  },
  {
    id: "feed-swasthya-gnews",
    name: "Google News - स्वास्थ्य व सेहत",
    category: "स्वास्थ्य",
    url: "https://news.google.com/rss/search?q=%E0%A4%B8%E0%A5%8D%E0%A4%B5%E0%A4%BE%E0%A4%B8%E0%A5%8D%E0%A4%A5%E0%A5%8D%E0%A4%AF+%E0%A4%B8%E0%A5%87%E0%A4%B9%E0%A4%A4+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 11. धर्म व अध्यात्म (Religion & Astrology)
  // ==========================================================================
  {
    id: "feed-dharm-abp",
    name: "ABP Live - धर्म",
    category: "धर्म",
    url: "https://www.abplive.com/astro/feed",
    enabled: true
  },
  {
    id: "feed-dharm-gnews",
    name: "Google News - धर्म व संस्कृति",
    category: "धर्म",
    url: "https://news.google.com/rss/search?q=%E0%A4%A7%E0%A4%B0%E0%A5%8D%E0%A4%AE+%E0%A4%85%E0%A4%A7%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%A4%E0%A5%8D%E0%A4%AE+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  },

  // ==========================================================================
  // 12. क्राइम व कानून (Crime & Law)
  // ==========================================================================
  {
    id: "feed-crime-abp",
    name: "ABP Live - क्राइम",
    category: "क्राइम",
    url: "https://www.abplive.com/crime/feed",
    enabled: true
  },
  {
    id: "feed-crime-gnews",
    name: "Google News - क्राइम व पुलिस",
    category: "क्राइम",
    url: "https://news.google.com/rss/search?q=%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%87%E0%A4%AE+%E0%A4%AA%E0%A5%81%E0%A4%B2%E0%A4%BF%E0%A4%B8+when:3d&hl=hi&gl=IN&ceid=IN:hi",
    enabled: true
  }
];

module.exports = defaultFeeds;
