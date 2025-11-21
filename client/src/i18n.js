import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esJSON from './locales/es.json';
import enJSON from './locales/en.json'; // Crea este archivo también

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: esJSON },
    en: { translation: enJSON }
  },
  lng: "es", // Idioma por defecto
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;