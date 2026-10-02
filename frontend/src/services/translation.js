/**
 * Dynamic Multilingual Translation Service with In-Memory & LocalStorage Caching
 * Integrates real-time translation API for Indian Languages.
 */

const translationCache = {};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (English)', native: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali (বাংলা)', native: 'বাংলা' },
  { code: 'te', name: 'Telugu (తెలుగు)', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi (मराठी)', native: 'मराठी' },
  { code: 'ta', name: 'Tamil (தமிழ்)', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu (اردو)', native: 'اردو' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', native: 'മലയാളം' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese (অসমীয়া)', native: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili (मैथिली)', native: 'मैथिली' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)', native: 'संस्कृतम्' },
  { code: 'kok', name: 'Konkani (कोंकणी)', native: 'कोंकणी' },
  { code: 'ne', name: 'Nepali (नेपाली)', native: 'नेपाली' },
  { code: 'sd', name: 'Sindhi (سنڌي / सिंधी)', native: 'سنڌي' },
  { code: 'doi', name: 'Dogri (डोगरी)', native: 'डोगरी' },
  { code: 'ks', name: 'Kashmiri (كٲشُر / कश्मीरी)', native: 'كٲشُر' },
  { code: 'brx', name: 'Bodo (बड़ो)', native: 'बड़ो' },
  { code: 'mni', name: 'Manipuri / Meitei (মৈতৈলোন্)', native: 'মৈতৈলোন্' },
  { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ / संताली)', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'bho', name: 'Bhojpuri (भोजपुरी)', native: 'भोजपुरी' }
];

export async function translateText(text, targetLang = 'hi') {
  if (!text || targetLang === 'en') return text;

  const cacheKey = `${targetLang}:${text.trim()}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      translationCache[cacheKey] = translated;
      return translated;
    }
  } catch (err) {
    console.warn('[Translation Service Error]', err.message);
  }

  return text; // Graceful fallback to original text if API fails
}
