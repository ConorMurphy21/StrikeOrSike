import {createI18n} from 'vue-i18n'
import * as en from './en.json'

const messages = {
    en: {
        ...en
    },
}

export default createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages
})
