import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import de from '../i18n/de.json'
import en from '../i18n/en.json'
import fr from '../i18n/fr.json'

const resources = {
  de: { translation: de },
  en: { translation: en },
  fr: { translation: fr }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Force German as default and only language
    fallbackLng: 'de',
    detection: {
      order: ['localStorage'], // Only localStorage, force German
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true
    },
    supportedLngs: ['de'], // Only German supported
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (value instanceof Date && format) {
          return new Intl.DateTimeFormat(lng, { dateStyle: format }).format(value);
        }
        return value;
      }
    }
  })

export default i18n
