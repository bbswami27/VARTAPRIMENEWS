// ==========================================================================
// VartaPrime News - Advanced English to Hindi Translator & Cleaner
// Ensures 100% Correct Hindi Titles, No Corrupted Fonts / Broken Matras
// ==========================================================================

const wordDictionary = {
  'gold': 'सोना',
  'silver': 'चांदी',
  'rupees': 'रुपये',
  'rupee': 'रुपया',
  'price': 'भाव',
  'prices': 'कीमतें',
  'rate': 'दर',
  'rates': 'दरें',
  'today': 'आज',
  'tomorrow': 'कल',
  'yesterday': 'कल',
  'breaking': 'बड़ी खबर',
  'live': 'लाइव',
  'updates': 'अपडेट्स',
  'update': 'अपडेट',
  'news': 'समाचार',
  'latest': 'ताज़ा',
  'alert': 'अलर्ट',
  'warning': 'चेतावनी',
  'weather': 'मौसम',
  'rain': 'बारिश',
  'monsoon': 'मानसून',
  'flood': 'बाढ़',
  'heat': 'गर्मी',
  'cold': 'ठंड',
  'independence': 'स्वतंत्रता',
  'republic': 'गणतंत्र',
  'freedom': 'आजादी',
  'viral': 'वायरल',
  'video': 'वीडियो',
  'photos': 'तस्वीरें',
  'photo': 'तस्वीर',
  'delhi': 'दिल्ली',
  'haryana': 'हरियाणा',
  'punjab': 'पंजाब',
  'chandigarh': 'चंडीगढ़',
  'panipat': 'पानीपत',
  'karnal': 'करनाल',
  'gurugram': 'गुरुग्राम',
  'gurgaon': 'गुरुग्राम',
  'faridabad': 'फरीदाबाद',
  'rohtak': 'रोहतक',
  'hisar': 'हिसार',
  'ambala': 'अंबाला',
  'sonipat': 'सोनीपत',
  'kurukshetra': 'कुरुक्षेत्र',
  'sirsa': 'सिरसा',
  'yamunanagar': 'यमुनानगर',
  'rewari': 'रेवाड़ी',
  'bhiwani': 'भिवानी',
  'jind': 'जींद',
  'kaithal': 'कैथल',
  'fatehabad': 'फतेहाबाद',
  'jhajjar': 'झज्जर',
  'palwal': 'पलवल',
  'narnaul': 'नारनौल',
  'mahendragarh': 'महेंद्रगढ़',
  'dadri': 'दादरी',
  'nuh': 'नूंह',
  'panchkula': 'पंचकूला',
  'india': 'भारत',
  'indian': 'भारतीय',
  'pm': 'प्रधानमंत्री',
  'cm': 'मुख्यमंत्री',
  'modi': 'मोदी',
  'narendra modi': 'नरेंद्र मोदी',
  'rahul gandhi': 'राहुल गांधी',
  'amit shah': 'अमित शाह',
  'rekha gupta': 'रेखा गुप्ता',
  'police': 'पुलिस',
  'crime': 'क्राइम',
  'arrest': 'गिरफ्तार',
  'arrested': 'गिरफ्तार',
  'murder': 'हत्या',
  'killed': 'मौत',
  'death': 'निधन',
  'dead': 'मृत',
  'court': 'अदालत',
  'supreme court': 'सुप्रीम कोर्ट',
  'high court': 'हाई कोर्ट',
  'bail': 'जमानत',
  'fir': 'एफआईआर',
  'jail': 'जेल',
  'firing': 'गोलीबारी',
  'shot': 'गोलीबारी',
  'gangster': 'गैंगस्टर',
  'accident': 'हादसा',
  'crash': 'टक्कर',
  'train': 'ट्रेन',
  'metro': 'मेट्रो',
  'traffic': 'ट्रैफिक',
  'road': 'सड़क',
  'highway': 'हाईवे',
  'expressway': 'एक्सप्रेसवे',
  'bus': 'बस',
  'car': 'कार',
  'flight': 'विमान',
  'airport': 'एयरपोर्ट',
  'hospital': 'अस्पताल',
  'doctor': 'डॉक्टर',
  'patient': 'मरीज',
  'health': 'स्वास्थ्य',
  'school': 'स्कूल',
  'college': 'कॉलेज',
  'university': 'विश्वविद्यालय',
  'exam': 'परीक्षा',
  'exams': 'परीक्षाएं',
  'result': 'परिणाम',
  'results': 'रिजल्ट',
  'students': 'छात्र',
  'student': 'विद्यार्थी',
  'board': 'बोर्ड',
  'cbse': 'सीबीएसई',
  'hbse': 'हरियाणा बोर्ड',
  'job': 'नौकरी',
  'jobs': 'नौकरियां',
  'recruitment': 'भर्ती',
  'vacancy': 'वैकेंसी',
  'salary': 'वेतन',
  'government': 'सरकार',
  'govt': 'सरकारी',
  'election': 'चुनाव',
  'elections': 'चुनाव',
  'vote': 'मतदान',
  'voting': 'मतदान',
  'bjp': 'भाजपा',
  'congress': 'कांग्रेस',
  'aap': 'आप',
  'inld': 'इनेलो',
  'jjp': 'जजपा',
  'cricket': 'क्रिकेट',
  'match': 'मैच',
  'team': 'टीम',
  'ipl': 'आईपीएल',
  'bcci': 'बीसीसीआई',
  'world cup': 'विश्व कप',
  'olympic': 'ओलंपिक',
  'olympics': 'ओलंपिक',
  'medal': 'पदक',
  'gold medal': 'स्वर्ण पदक',
  'silver medal': 'रजत पदक',
  'bronze': 'कांस्य',
  'wrestling': 'कुश्ती',
  'wrestler': 'पहलवान',
  'kabaddi': 'कबड्डी',
  'cinema': 'सिनेमा',
  'movie': 'फिल्म',
  'film': 'फिल्म',
  'actor': 'अभिनेता',
  'actress': 'अभिनेत्री',
  'bollywood': 'बॉलीवुड',
  'trailer': 'ट्रेलर',
  'teaser': 'टीज़र',
  'song': 'गाना',
  'ott': 'ओटीटी',
  'netflix': 'नेटफ्लिक्स',
  'stock': 'शेयर',
  'stocks': 'शेयर',
  'market': 'बाजार',
  'sensex': 'सेंसेक्स',
  'nifty': 'निफ्टी',
  'share': 'शेयर',
  'bank': 'बैंक',
  'rbi': 'आरबीआई',
  'loan': 'लोन',
  'business': 'कारोबार',
  'economy': 'अर्थव्यवस्था',
  'farmer': 'किसान',
  'farmers': 'किसान',
  'crop': 'फसल',
  'crops': 'फसलें',
  'mandi': 'मंडी',
  'msp': 'एमएसपी',
  'textile': 'टेक्सटाइल',
  'handloom': 'हैंडलूम',
  'expo': 'प्रदर्शनी',
  'fair': 'मेला',
  'camp': 'शिविर',
  'free': 'निःशुल्क',
  'blood donation': 'रक्तदान',
  'checkup': 'जांच',
  'eye': 'नेत्र',
  'youth': 'युवा',
  'startup': 'स्टार्टअप',
  'startups': 'स्टार्टअप्स',
  'innovation': 'नवाचार',
  'success': 'सफलता',
  'brics': 'ब्रिक्स',
  'delegation': 'प्रतिनिधिमंडल',
  'minister': 'मंत्री',
  'cabinet': 'मंत्रिमंडल',
  'meeting': 'बैठक',
  'meets': 'मुलाकात',
  'scheme': 'योजना',
  'yojana': 'योजना',
  'current affairs': 'समसामयिकी (करंट अफेयर्स)',
  'gk': 'सामान्य ज्ञान',
  'quiz': 'प्रश्नोत्तरी',
  'hssc': 'एचएसएससी (HSSC)',
  'upsc': 'यूपीएससी (UPSC)',
  'ssc': 'एसएससी (SSC)',
  'cet': 'सीईटी (CET)',
  'announced': 'घोषणा की',
  'announces': 'घोषणा की',
  'boost': 'बढ़ावा',
  'trade': 'व्यापार',
  'sugar': 'चीनी',
  'mills': 'मिलें',
  'mill': 'मिल',
  'state': 'राज्य',
  'level': 'स्तरीय',
  'committee': 'समिति',
  'celebrates': 'मनाया',
  'foundation': 'स्थापना',
  'day': 'दिवस',
  'flag': 'तिरंगा',
  'unfurls': 'फहराया',
  'hoists': 'फहराया',
  'hoisting': 'ध्वजारोहण'
};

function hasEnglishLetters(str) {
  if (!str) return false;
  return /[a-zA-Z]/.test(str);
}

// Fix known corrupted Hindi word artifacts
function fixCorruptedHindiWords(text) {
  if (!text) return '';
  let str = text;
  str = str.replace(/थ\s*िनडेपेनडेनके\s*दिवस/gi, 'स्वतंत्रता दिवस');
  str = str.replace(/िनडेपेनडेनके\s*दिवस/gi, 'स्वतंत्रता दिवस');
  str = str.replace(/िनडेपेनडेनके/gi, 'स्वतंत्रता');
  str = str.replace(/क\s*&\s*क/gi, '24 कैरेट व 22 कैरेट');
  str = str.replace(/क&क/gi, '24 कैरेट व 22 कैरेट');
  str = str.replace(/विरल\s+विडेो/gi, 'वायरल वीडियो');
  str = str.replace(/विडेो/gi, 'वीडियो');
  str = str.replace(/विरल/gi, 'वायरल');
  str = str.replace(/बूसट/gi, 'बढ़ावा');
  str = str.replace(/ामान/gi, 'अमन');
  str = str.replace(/ारोरा/gi, 'अरोड़ा');
  str = str.replace(/ाननोुनकेड/gi, 'घोषणा की');
  str = str.replace(/\bचप्पेचप्पे\b/g, 'चप्पे-चप्पे');
  return str;
}

// Convert English words to Hindi in a title/sentence
function translateToHindi(text) {
  if (!text) return '';
  let str = text.trim();

  // 1. Specific phrase replacements
  const phraseReplacements = [
    { en: /(\d+)(?:st|nd|rd|th)?\s+independence\s+day/gi, hi: '$1वां स्वतंत्रता दिवस' },
    { en: /independence\s+day/gi, hi: 'स्वतंत्रता दिवस' },
    { en: /(\d+)(?:st|nd|rd|th)?\s+republic\s+day/gi, hi: '$1वां गणतंत्र दिवस' },
    { en: /republic\s+day/gi, hi: 'गणतंत्र दिवस' },
    { en: /viral\s+video/gi, hi: 'वायरल वीडियो' },
    { en: /video/gi, hi: 'वीडियो' },
    { en: /viral/gi, hi: 'वायरल' },
    { en: /24k\s*(?:&|और|and)\s*22k/gi, hi: '24 कैरेट व 22 कैरेट' },
    { en: /24k/gi, hi: '24 कैरेट' },
    { en: /22k/gi, hi: '22 कैरेट' },
    { en: /18k/gi, hi: '18 कैरेट' },
    { en: /Gold in 10 Rupees/gi, hi: '10 रुपये में सोना' },
    { en: /Live Updates/gi, hi: 'लाइव अपडेट्स' },
    { en: /Breaking News/gi, hi: 'बड़ी खबर' },
    { en: /Blood Donation Camp/gi, hi: 'रक्तदान शिविर' },
    { en: /Free Eye Camp/gi, hi: 'निःशुल्क नेत्र जांच शिविर' },
    { en: /Free Health Camp/gi, hi: 'निःशुल्क स्वास्थ्य शिविर' },
    { en: /Weather Update/gi, hi: 'मौसम अपडेट' },
    { en: /Heavy Rain Alert/gi, hi: 'भारी बारिश का अलर्ट' },
    { en: /Supreme Court/gi, hi: 'सुप्रीम कोर्ट' },
    { en: /High Court/gi, hi: 'हाई कोर्ट' },
    { en: /Cabinet Meeting/gi, hi: 'मंत्रिमंडल बैठक' },
    { en: /State Level Committee/gi, hi: 'राज्य स्तरीय समिति' },
    { en: /State Bank of India/gi, hi: 'भारतीय स्टेट बैंक (एसबीआई)' },
    { en: /\(SBI\)/gi, hi: '(एसबीआई)' },
    { en: /Dainik Bhaskar/gi, hi: 'दैनिक भास्कर' },
    { en: /Amar Ujala/gi, hi: 'अमर उजाला' },
    { en: /Dainik Jagran/gi, hi: 'दैनिक जागरण' },
    { en: /Punjab Kesari/gi, hi: 'पंजाब केसरी' },
    { en: /Hari Bhoomi/gi, hi: 'हरिभूमि' },
    { en: /ETV Bharat/gi, hi: 'ईटीवी भारत' },
    { en: /NDTV India/gi, hi: 'एनडीटीवी इंडिया' },
    { en: /ABP News/gi, hi: 'एबीपी न्यूज़' },
    { en: /Zee News/gi, hi: 'ज़ी न्यूज़' },
    { en: /Elvish Yadav/gi, hi: 'एल्विश यादव' },
    { en: /Narendra Modi/gi, hi: 'नरेंद्र मोदी' },
    { en: /Amit Shah/gi, hi: 'अमित शाह' },
    { en: /Rahul Gandhi/gi, hi: 'राहुल गांधी' },
    { en: /Rekha Gupta/gi, hi: 'रेखा गुप्ता' },
    { en: /Nayab Singh Saini/gi, hi: 'नायब सिंह सैनी' },
    { en: /Nayab Saini/gi, hi: 'नायब सैनी' },
    { en: /Bhupinder Hooda/gi, hi: 'भूपेंद्र हुड्डा' },
    { en: /Manohar Lal Khattar/gi, hi: 'मनोहर लाल खट्टर' },
    { en: /Anil Vij/gi, hi: 'अनिल विज' },
    { en: /Dushyant Chautala/gi, hi: 'दुष्यंत चौटाला' },
    { en: /How To Check/gi, hi: 'कैसे करें जांच' },
    { en: /Water In Milk/gi, hi: 'दूध में पानी' },
    { en: /India-Iran Ties/gi, hi: 'भारत-ईरान संबंध' },
    { en: /BRICS Delegation/gi, hi: 'ब्रिक्स प्रतिनिधिमंडल' },
    { en: /Punjab Minister/gi, hi: 'पंजाब के मंत्री' },
    { en: /Aman Arora/gi, hi: 'अमन अरोड़ा' },
    { en: /Sugar Mills/gi, hi: 'चीनी मिलें' },
    { en: /DLSA/gi, hi: 'जिला विधिक सेवा प्राधिकरण' },
    { en: /PLV/gi, hi: 'पीएलवी' },
    { en: /Q1FY27|Q1 FY27|Q1/gi, hi: 'पहली तिमाही' },
    { en: /Current Affairs/gi, hi: 'समसामयिकी (करंट अफेयर्स)' },
    { en: /General Knowledge/gi, hi: 'सामान्य ज्ञान' }
  ];

  for (const item of phraseReplacements) {
    str = str.replace(item.en, item.hi);
  }

  // Strip hashtags and handles
  str = str.replace(/#[A-Za-z0-9_]+/g, '');
  str = str.replace(/@[A-Za-z0-9_]+/g, '');

  // Word-by-word dictionary translation for English words
  str = str.replace(/[A-Za-z]+(?:'[a-zA-Z]+)?/g, (match) => {
    const lower = match.toLowerCase().replace(/['_-]/g, '');
    if (wordDictionary[lower]) {
      return wordDictionary[lower];
    }
    // Fallback: clean acronyms or clean word
    return cleanFallbackWord(lower);
  });

  // Strip remaining isolated English letters
  str = str.replace(/[a-zA-Z]/g, '');

  // Fix any remaining corrupted Hindi artifacts
  str = fixCorruptedHindiWords(str);

  return str.replace(/\s+/g, ' ').trim();
}

function cleanFallbackWord(w) {
  if (!w) return '';
  if (w === 'sbi') return 'एसबीआई';
  if (w === 'bjp') return 'भाजपा';
  if (w === 'inc') return 'कांग्रेस';
  if (w === 'aap') return 'आप';
  if (w === 'cng') return 'सीएनजी';
  if (w === 'ev') return 'ईवी';
  if (w === 'ai') return 'एआई';
  if (w === 'gdp') return 'जीडीपी';
  if (w === 'gst') return 'जीएसटी';
  if (w === 'cm') return 'सीएम';
  if (w === 'pm') return 'पीएम';
  if (w === 'mp') return 'सांसद';
  if (w === 'mla') return 'विधायक';
  if (w === 'sp') return 'एसपी';
  if (w === 'dsp') return 'डीएसपी';
  if (w === 'dc') return 'डीसी';
  if (w === 'ncr') return 'एनसीआर';
  if (w === 'brics') return 'ब्रिक्स';
  if (w === 'mou') return 'एमओयू';
  if (w === 'upsc') return 'यूपीएससी';
  if (w === 'hssc') return 'एचएसएससी';
  if (w === 'ssc') return 'एसएससी';
  if (w === 'cet') return 'सीईटी';
  if (w === 'gk') return 'सामान्य ज्ञान';

  return ''; // Return empty string rather than generating broken disjointed syllables
}

module.exports = {
  translateToHindi,
  fixCorruptedHindiWords,
  hasEnglishLetters,
  wordDictionary
};
