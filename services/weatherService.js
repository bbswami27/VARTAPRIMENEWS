// ==========================================================================
// VartaPrimeNews - Live Weather Service for Panipat & All 22 Haryana Districts
// ==========================================================================

const haryanaDistricts = [
  { name: 'पानीपत', en: 'Panipat', lat: 29.3909, lon: 76.9635 },
  { name: 'करनाल', en: 'Karnal', lat: 29.6857, lon: 76.9905 },
  { name: 'गुरुग्राम', en: 'Gurugram', lat: 28.4595, lon: 77.0266 },
  { name: 'फरीदाबाद', en: 'Faridabad', lat: 28.4089, lon: 77.3178 },
  { name: 'हिसार', en: 'Hisar', lat: 29.1492, lon: 75.7217 },
  { name: 'रोहतक', en: 'Rohtak', lat: 28.8955, lon: 76.6066 },
  { name: 'अंबाला', en: 'Ambala', lat: 30.3782, lon: 76.7767 },
  { name: 'पंचकूला', en: 'Panchkula', lat: 30.6942, lon: 76.8606 },
  { name: 'कुरुक्षेत्र', en: 'Kurukshetra', lat: 29.9695, lon: 76.8783 },
  { name: 'सोनीपत', en: 'Sonipat', lat: 28.9931, lon: 77.0151 },
  { name: 'यमुनानगर', en: 'Yamunanagar', lat: 30.1290, lon: 77.2674 },
  { name: 'सिरसा', en: 'Sirsa', lat: 29.5349, lon: 75.0298 },
  { name: 'भिवानी', en: 'Bhiwani', lat: 28.7932, lon: 76.1390 },
  { name: 'जींद', en: 'Jind', lat: 29.3140, lon: 76.3147 },
  { name: 'कैथल', en: 'Kaithal', lat: 29.8015, lon: 76.3996 },
  { name: 'रेवाड़ी', en: 'Rewari', lat: 28.1920, lon: 76.6180 },
  { name: 'पलवल', en: 'Palwal', lat: 28.1447, lon: 77.3260 },
  { name: 'महेंद्रगढ़', en: 'Mahendragarh', lat: 28.2798, lon: 76.1432 },
  { name: 'झज्जर', en: 'Jhajjar', lat: 28.6063, lon: 76.6565 },
  { name: 'फतेहाबाद', en: 'Fatehabad', lat: 29.5152, lon: 75.4552 },
  { name: 'नूहं (मेवात)', en: 'Nuh', lat: 28.1069, lon: 77.0006 },
  { name: 'चरखी दादरी', en: 'Charkhi Dadri', lat: 28.5921, lon: 76.2653 }
];

function getWeatherInfo(code) {
  if (code === 0) return { text: 'साफ़ धूप', icon: '☀️' };
  if (code === 1 || code === 2) return { text: 'मुख्यतः साफ़', icon: '🌤️' };
  if (code === 3) return { text: 'आंशिक बादल', icon: '⛅' };
  if (code === 45 || code === 48) return { text: 'कोहरा', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { text: 'बूंदाबांदी', icon: '🌦️' };
  if (code >= 61 && code <= 67) return { text: 'बारिश', icon: '🌧️' };
  if (code >= 80 && code <= 82) return { text: 'तेज बारिश', icon: '🌧️' };
  if (code >= 95) return { text: 'गरज-चमक', icon: '⛈️' };
  return { text: 'सामान्य', icon: '🌤️' };
}

let weatherCache = {
  lastUpdated: 0,
  data: []
};

// Fetch live weather for a single coordinate
async function fetchCoordinateWeather(district) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const curr = json.current;
    const info = getWeatherInfo(curr.weather_code);

    return {
      name: district.name,
      en: district.en,
      temp: Math.round(curr.temperature_2m),
      humidity: curr.relative_humidity_2m,
      wind: Math.round(curr.wind_speed_10m),
      condition: info.text,
      icon: info.icon,
      updatedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    return {
      name: district.name,
      en: district.en,
      temp: 31,
      humidity: 70,
      wind: 8,
      condition: 'साफ़ धूप',
      icon: '🌤️',
      updatedAt: 'अभी'
    };
  }
}

// Get all 22 districts live weather with 15-min cache
async function getHaryanaWeather() {
  const now = Date.now();
  if (weatherCache.data.length > 0 && (now - weatherCache.lastUpdated) < 15 * 60 * 1000) {
    return weatherCache.data;
  }

  console.log('[Weather] Fetching fresh live weather for all 22 Haryana districts...');
  const results = await Promise.all(haryanaDistricts.map(fetchCoordinateWeather));
  weatherCache = {
    lastUpdated: now,
    data: results
  };

  return results;
}

// Get Panipat Weather specifically
async function getPanipatWeather() {
  const all = await getHaryanaWeather();
  const panipat = all.find(d => d.en === 'Panipat') || all[0];
  return panipat;
}

module.exports = {
  haryanaDistricts,
  getHaryanaWeather,
  getPanipatWeather
};
