import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText, SUPPORTED_LANGUAGES } from '../services/translation';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('samadhan_lang') || 'en');

  useEffect(() => {
    // Inject Google Translate script for seamless full-page translation
    if (!document.getElementById('google-translate-script')) {
      const googleDiv = document.createElement('div');
      googleDiv.id = 'google_translate_element';
      googleDiv.style.display = 'none';
      document.body.appendChild(googleDiv);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en', 
              includedLanguages: 'en,hi,mr,bn,ta,te,gu,kn,ml,pa,ur,or,as,mai,sa,kok,gom,ne,sd,doi,ks,brx,bodo,mni,mni-Mtei,sat,bho',
              autoDisplay: false
            },
            'google_translate_element'
          );
        }
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('samadhan_lang', newLang);

    // Map common aliases to Google Translate language codes if needed
    const googleLangMap = {
      'kok': 'gom',      // Konkani is 'gom' in Google Translate
      'mni': 'mni-Mtei', // Manipuri is 'mni-Mtei'
      'brx': 'bodo'      // Bodo is 'bodo' in Google Translate widgets
    };

    const targetGoogleLang = googleLangMap[newLang] || newLang;

    // Apply cookie and trigger Google Translate Widget
    try {
      if (newLang === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
      }
      document.cookie = `googtrans=/en/${targetGoogleLang}; path=/`;
      document.cookie = `googtrans=/en/${targetGoogleLang}; domain=.${window.location.hostname}; path=/`;
      document.cookie = `googtrans=/en/${newLang}; path=/`;
      document.cookie = `googtrans=/en/${newLang}; domain=.${window.location.hostname}; path=/`;
      
      const select = document.querySelector('#google_translate_element select');
      if (select) {
        let matchedVal = null;
        for (let i = 0; i < select.options.length; i++) {
          const val = select.options[i].value;
          if (
            val === targetGoogleLang || 
            val === newLang || 
            val.startsWith(newLang + '-') ||
            (googleLangMap[newLang] && val === googleLangMap[newLang])
          ) {
            matchedVal = val;
            break;
          }
        }

        if (matchedVal) {
          select.value = matchedVal;
        } else {
          select.value = targetGoogleLang;
        }
        select.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.warn('[Language Switch Exception]', e);
    }
  };

  const t = (text) => text;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
