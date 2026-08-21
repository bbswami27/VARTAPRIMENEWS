// ==========================================================================
// VartaPrimeNews - State, District & City Taxonomy & Location Service
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

// Bilingual dictionary for translation & normalization (English <-> Hindi)
const LOCATION_DICTIONARY = {
  // States
  'haryana': 'हरियाणा',
  'delhi': 'दिल्ली',
  'nct of delhi': 'दिल्ली',
  'uttar pradesh': 'उत्तर प्रदेश',
  'up': 'उत्तर प्रदेश',
  'punjab': 'पंजाब',
  'rajasthan': 'राजस्थान',
  'bihar': 'बिहार',
  'madhya pradesh': 'मध्य प्रदेश',
  'mp': 'मध्य प्रदेश',
  'uttarakhand': 'उत्तराखंड',
  'himachal pradesh': 'हिमाचल प्रदेश',
  'maharashtra': 'महाराष्ट्र',
  'gujarat': 'गुजरात',
  
  // Haryana Districts & Towns
  'panipat': 'पानीपत',
  'karnal': 'करनाल',
  'gurgaon': 'गुरुग्राम',
  'gurugram': 'गुरुग्राम',
  'faridabad': 'फरीदाबाद',
  'hisar': 'हिसार',
  'rohtak': 'रोहतक',
  'ambala': 'अंबाला',
  'panchkula': 'पंचकूला',
  'kurukshetra': 'कुरुक्षेत्र',
  'sonipat': 'सोनीपत',
  'sonepat': 'सोनीपत',
  'yamunanagar': 'यमुनानगर',
  'yamuna nagar': 'यमुनानगर',
  'sirsa': 'सिरसा',
  'bhiwani': 'भिवानी',
  'jind': 'जींद',
  'kaithal': 'कैथल',
  'rewari': 'रेवाड़ी',
  'palwal': 'पलवल',
  'mahendragarh': 'महेंद्रगढ़',
  'narnaul': 'महेंद्रगढ़',
  'jhajjar': 'झज्जर',
  'fatehabad': 'फतेहाबाद',
  'nuh': 'नूहं',
  'mewat': 'नूहं',
  'charkhi dadri': 'चरखी दादरी',
  'dadri': 'चरखी दादरी',
  
  // Major Cities across India
  'new delhi': 'नई दिल्ली',
  'delhi cantt': 'नई दिल्ली',
  'chandigarh': 'चंडीगढ़',
  'mohali': 'मोहाली',
  'ludhiana': 'लुधियाना',
  'amritsar': 'अमृतसर',
  'jalandhar': 'जालंधर',
  'lucknow': 'लखनऊ',
  'noida': 'नोएडा',
  'greater noida': 'नोएडा',
  'ghaziabad': 'गाजियाबाद',
  'varanasi': 'वाराणसी',
  'banaras': 'वाराणसी',
  'kashi': 'वाराणसी',
  'kanpur': 'कानपुर',
  'agra': 'आगरा',
  'meerut': 'मेरठ',
  'prayagraj': 'प्रयागराज',
  'allahabad': 'प्रयागराज',
  'jaipur': 'जयपुर',
  'jodhpur': 'जोधपुर',
  'udaipur': 'उदयपुर',
  'kota': 'कोटा',
  'patna': 'पटना',
  'gaya': 'गया',
  'bhopal': 'भोपाल',
  'indore': 'इंदौर',
  'dehradun': 'देहरादून',
  'haridwar': 'हरिद्वार',
  'shimla': 'शिमला',
  'mumbai': 'मुंबई',
  'bombay': 'मुंबई',
  'pune': 'पुणे',
  'ahmedabad': 'अहमदाबाद',
  'surat': 'सूरत'
};

// Reverse map for Hindi -> English
const HINDI_TO_ENGLISH = {};
for (const [eng, hin] of Object.entries(LOCATION_DICTIONARY)) {
  if (!HINDI_TO_ENGLISH[hin]) {
    HINDI_TO_ENGLISH[hin] = eng.charAt(0).toUpperCase() + eng.slice(1);
  }
}

/**
 * Normalize any input location name into canonical Hindi & English formats.
 */
function normalizeLocation(cityInput = '', regionInput = '') {
  let rawCity = (cityInput || '').trim();
  let rawRegion = (regionInput || '').trim();

  let cityLower = rawCity.toLowerCase();
  let regionLower = rawRegion.toLowerCase();

  let cityHindi = LOCATION_DICTIONARY[cityLower] || rawCity;
  let regionHindi = LOCATION_DICTIONARY[regionLower] || rawRegion;

  // Infer region if city is recognized in Haryana
  if (!regionHindi || regionHindi === 'Unknown' || regionHindi === 'all') {
    if (HARYANA_DISTRICTS.includes(cityHindi)) {
      regionHindi = 'हरियाणा';
    } else if (DELHI_AREAS.includes(cityHindi) || cityHindi.includes('दिल्ली')) {
      regionHindi = 'दिल्ली';
    } else {
      for (const [st, dists] of Object.entries(STATES_DATA)) {
        if (dists.includes(cityHindi)) {
          regionHindi = st;
          break;
        }
      }
    }
  }

  if (!regionHindi) regionHindi = 'हरियाणा';
  if (!cityHindi) cityHindi = 'पानीपत';

  const cityEnglish = HINDI_TO_ENGLISH[cityHindi] || rawCity || 'Panipat';
  const regionEnglish = HINDI_TO_ENGLISH[regionHindi] || rawRegion || 'Haryana';

  return {
    city: cityHindi,
    region: regionHindi,
    district: cityHindi,
    state: regionHindi,
    cityHindi,
    regionHindi,
    cityEnglish,
    regionEnglish
  };
}

/**
 * Auto-detect State and District/City from News Title / Content
 */
function detectLocation(title = '', content = '', defaultCategory = '') {
  const text = (title + ' ' + content).toLowerCase();

  // 1. Check Delhi specifically
  if (defaultCategory === 'दिल्ली' || text.includes('दिल्ली') || text.includes('delhi')) {
    for (const area of DELHI_AREAS) {
      if (text.includes(area.toLowerCase())) {
        return { state: 'दिल्ली', district: area, region: 'दिल्ली', city: area };
      }
    }
    return { state: 'दिल्ली', district: 'नई दिल्ली', region: 'दिल्ली', city: 'नई दिल्ली' };
  }

  // 2. Check Haryana Districts (Hindi & English)
  for (const dist of HARYANA_DISTRICTS) {
    if (text.includes(dist.toLowerCase())) {
      return { state: 'हरियाणा', district: dist, region: 'हरियाणा', city: dist };
    }
  }
  for (const [eng, hin] of Object.entries(LOCATION_DICTIONARY)) {
    if (HARYANA_DISTRICTS.includes(hin) && text.includes(eng)) {
      return { state: 'हरियाणा', district: hin, region: 'हरियाणा', city: hin };
    }
  }

  // 3. Check other states and districts
  for (const [state, districts] of Object.entries(STATES_DATA)) {
    if (text.includes(state.toLowerCase())) {
      for (const dist of districts) {
        if (text.includes(dist.toLowerCase())) {
          return { state, district: dist, region: state, city: dist };
        }
      }
      return { state, district: 'सभी जिले', region: state, city: 'सभी जिले' };
    }

    for (const dist of districts) {
      if (text.includes(dist.toLowerCase())) {
        return { state, district: dist, region: state, city: dist };
      }
    }
  }

  // 4. Category Fallbacks
  if (defaultCategory === 'हरियाणा') {
    return { state: 'हरियाणा', district: 'पानीपत', region: 'हरियाणा', city: 'पानीपत' };
  }

  return { state: 'राष्ट्रीय / देश', district: 'मुख्य', region: 'राष्ट्रीय / देश', city: 'मुख्य' };
}

/**
 * Check if two city names match (handles Hindi, English, and substring variations)
 */
function isMatchingCity(articleCity = '', userCity = '') {
  if (!articleCity || !userCity) return false;
  const aNorm = normalizeLocation(articleCity).cityHindi.toLowerCase();
  const uNorm = normalizeLocation(userCity).cityHindi.toLowerCase();
  if (aNorm === uNorm) return true;
  return aNorm.includes(uNorm) || uNorm.includes(aNorm);
}

/**
 * Check if two region names match (handles Hindi, English, variations)
 */
function isMatchingRegion(articleRegion = '', userRegion = '') {
  if (!articleRegion || !userRegion) return false;
  const aNorm = normalizeLocation('', articleRegion).regionHindi.toLowerCase();
  const uNorm = normalizeLocation('', userRegion).regionHindi.toLowerCase();
  if (aNorm === uNorm) return true;
  return aNorm.includes(uNorm) || uNorm.includes(aNorm);
}

// In-memory cache for IP and geocode lookups
const locationCache = new Map();

/**
 * Reverse-geocode latitude and longitude into City & State/Region
 */
async function reverseGeocode(lat, lon) {
  if (!lat || !lon) return normalizeLocation('पानीपत', 'हरियाणा');
  const cacheKey = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en,hi`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VartaPrimeNews-Portal/1.0 (https://vartaprimenews.com; contact@vartaprime.com)'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Reverse geocode failed with status ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};

    const rawCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.suburb || 'Panipat';
    const rawRegion = addr.state || 'Haryana';

    const normalized = normalizeLocation(rawCity, rawRegion);
    normalized.latitude = lat;
    normalized.longitude = lon;
    normalized.displayName = data.display_name;

    locationCache.set(cacheKey, normalized);
    return normalized;
  } catch (err) {
    console.warn('[Location] Reverse geocoding warning:', err.message);
    return normalizeLocation('पानीपत', 'हरियाणा');
  }
}

/**
 * Detect location from IP address (server-side fallback)
 */
async function detectLocationFromIP(ip = '') {
  const cleanIp = (ip || '').replace(/^.*:/, '').trim(); // Remove IPv6 mapping if any

  // Detect localhost / private IPs
  const isPrivate = !cleanIp || 
    cleanIp === '127.0.0.1' || 
    cleanIp === 'localhost' || 
    cleanIp === '::1' || 
    cleanIp.startsWith('192.168.') || 
    cleanIp.startsWith('10.') || 
    cleanIp.startsWith('172.');

  if (isPrivate) {
    return {
      ...normalizeLocation('पानीपत', 'हरियाणा'),
      ip: cleanIp || '127.0.0.1',
      source: 'default_local',
      isLocalhost: true
    };
  }

  if (locationCache.has(cleanIp)) {
    return locationCache.get(cleanIp);
  }

  try {
    // Try ipapi.co with fallback
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://ipapi.co/${cleanIp}/json/`, {
      headers: { 'User-Agent': 'VartaPrimeNews-Backend/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) {
        const normalized = normalizeLocation(data.city || 'Panipat', data.region || 'Haryana');
        normalized.ip = cleanIp;
        normalized.source = 'ipapi';
        normalized.latitude = data.latitude;
        normalized.longitude = data.longitude;
        locationCache.set(cleanIp, normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn(`[Location] IP lookup fallback for ${cleanIp}:`, err.message);
  }

  const fallback = {
    ...normalizeLocation('पानीपत', 'हरियाणा'),
    ip: cleanIp,
    source: 'fallback_default'
  };
  locationCache.set(cleanIp, fallback);
  return fallback;
}

module.exports = {
  HARYANA_DISTRICTS,
  DELHI_AREAS,
  STATES_DATA,
  LOCATION_DICTIONARY,
  HINDI_TO_ENGLISH,
  normalizeLocation,
  detectLocation,
  isMatchingCity,
  isMatchingRegion,
  reverseGeocode,
  detectLocationFromIP
};
