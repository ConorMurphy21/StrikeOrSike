import {createI18n} from 'vue-i18n'
import en from './en.js'

const messages = {
    en: {
        ...en
    },
}

export default createI18n<[typeof en], 'en'>({
    locale: 'en',
    fallbackLocale: 'en',
    messages
})
