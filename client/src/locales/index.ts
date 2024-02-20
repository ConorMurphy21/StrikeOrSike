import { createI18n } from 'vue-i18n';
import en from './en.js';

const messages = {
  en: {
    ...en
  }
};

const i18n = createI18n<[typeof en], 'en'>({
  locale: 'en',
  fallbackLocale: 'en',
  legacy: false,
  messages
});

export default i18n;

if (import.meta.hot) {
  import.meta.hot.accept('./en.ts', (newEn) => {
    if (newEn) {
      i18n.global.setLocaleMessage('en', newEn.default);
    }
  });
}
