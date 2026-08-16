// ==========================================================================
// VartaPrime News - State & District Taxonomy & Auto-Tagger Service
// ==========================================================================

const HARYANA_DISTRICTS = [
  'पानीपत', 'करनाल', 'गुरुग्राम', 'फरीदाबाद', 'हिसार', 'रोहतक',
  'अंबाला', 'पंचकूला', 'कुरुक्षेत्र', 'सोनीपत', 'यमुनानगर', 'सिरसा',
  'भिवानी', 'जींद', 'कैथल', 'रेवाड़ी', 'पलवल', 'महेंद्रगढ़',
  'झज्जर', 'फतेहाबाद', 'नूहं', 'चरखी दादरी'
];

const DELHI_AREAS = [
  'नई दिल्ली', 'दक्षिण दिल्ली', 'उत्तरी दिल्ली', 'पूर्वी दिल्ली', 'पश्चिमी दिल्ली',
  'द्वारका', 'रोहिणी', 'चांदनी चौक', 'शाहदरा', 'मध्य दिल्ली', 'कनॉट प्लेस', 'साकेत', 'करोल बाग', 'लाजपत नगर'
];

const STATES_DATA = {
  'हरियाणा': HARYANA_DISTRICTS,
  'दिल्ली': DELHI_AREAS,
  'उत्तर प्रदेश': ['लखनऊ', 'नोएडा', 'गाजियाबाद', 'वाराणसी', 'प्रयागराज', 'कानपुर', 'आगरा', 'मेरठ', 'गोरखपुर', 'मथुरा', 'सहारनपुर', 'अलीगढ़', 'मुरादाबाद', 'अयोध्या', 'झांसी'],
  'पंजाब': ['चंडीगढ़', 'अमृतसर', 'लुधियाना', 'जालंधर', 'पटियाला', 'बठिंडा', 'मोहाली', 'पठानकोट', 'होशियारपुर', 'गुरदासपुर'],
  'राजस्थान': ['जयपुर', 'जोधपुर', 'उदयपुर', 'कोटा', 'अजमेर', 'बीकानेर', 'अलवर', 'भरतपुर', 'सीकर', 'पाली'],
  'बिहार': ['पटना', 'गया', 'मुजफ्फरपुर', 'भागलपुर', 'दरभंगा', 'पूर्णिया', 'आरा', 'बेगूसराय', 'समस्तीपुर', 'नालंदा'],
  'मध्य प्रदेश': ['भोपाल', 'इंदौर', 'ग्वालियर', 'जबलपुर', 'उज्जैन', 'सागर', 'रीवा', 'सतना', 'रतलाम'],
  'उत्तराखंड': ['देहरादून', 'हरिद्वार', 'ऋषिकेश', 'नैनीताल', 'हल्द्वानी', 'रुद्रपुर', 'अल्मोड़ा'],
  'हिमाचल प्रदेश': ['शिमला', 'मंडी', 'धर्मशाला', 'कुल्लू', 'मनाली', 'सोलन', 'बिलासपुर', 'हमीरपुर'],
  'महाराष्ट्र': ['मुंबई', 'पुणे', 'नागपुर', 'नासिक', 'ठाणे', 'औरंगाबाद', 'कोल्हापुर'],
  'गुजरात': ['अहमदाबाद', 'सूरत', 'वडोदरा', 'राजकोट', 'गांधीनगर', 'भावनगर', 'जामनगर']
};

// Auto-detect State and District from News Title / Content
function detectLocation(title = '', content = '', defaultCategory = '') {
  const text = (title + ' ' + content).toLowerCase();

  // 1. Check Delhi specifically
  if (defaultCategory === 'दिल्ली' || text.includes('दिल्ली') || text.includes('delhi')) {
    for (const area of DELHI_AREAS) {
      if (text.includes(area.toLowerCase())) {
        return { state: 'दिल्ली', district: area };
      }
    }
    return { state: 'दिल्ली', district: 'नई दिल्ली' };
  }

  // 2. Check Haryana Districts
  for (const dist of HARYANA_DISTRICTS) {
    if (text.includes(dist.toLowerCase())) {
      return { state: 'हरियाणा', district: dist };
    }
  }

  // 3. Check other states and districts
  for (const [state, districts] of Object.entries(STATES_DATA)) {
    if (text.includes(state.toLowerCase())) {
      for (const dist of districts) {
        if (text.includes(dist.toLowerCase())) {
          return { state, district: dist };
        }
      }
      return { state, district: 'सभी जिले' };
    }

    for (const dist of districts) {
      if (text.includes(dist.toLowerCase())) {
        return { state, district: dist };
      }
    }
  }

  // 4. Category Fallbacks
  if (defaultCategory === 'हरियाणा') {
    return { state: 'हरियाणा', district: 'पानीपत' };
  }

  return { state: 'राष्ट्रीय / देश', district: 'मुख्य' };
}

module.exports = {
  HARYANA_DISTRICTS,
  DELHI_AREAS,
  STATES_DATA,
  detectLocation
};
