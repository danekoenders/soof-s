import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../locales/en.json';
// import csCZTranslation from '../locales/cs-CZ.json';
// import daDKTranslation from '../locales/da-DK.json';
// import deDETranslation from '../locales/de-DE.json';
// import esESTranslation from '../locales/es-ES.json';
// import frFRTranslation from '../locales/fr-FR.json';
// import itITTranslation from '../locales/it-IT.json';
// import jaJPTranslation from '../locales/ja-JP.json';
// import koKRTranslation from '../locales/ko-KR.json';
// import nbNOTranslation from '../locales/nb-NO.json';
import nlNLTranslation from '../locales/nl-NL.json';
// import plPLTranslation from '../locales/pl-PL.json';
// import ptBRTranslation from '../locales/pt-BR.json';
// import svSETranslation from '../locales/sv-SE.json';
// import thTHTranslation from '../locales/th-TH.json';
// import trTRTranslation from '../locales/tr-TR.json';
// import zhCNTranslation from '../locales/zh-CN.json';
// import zhTWTranslation from '../locales/zh-TW.json';


i18n
    .use(initReactI18next)
    .init({
        resources: {
            'en': { translation: enTranslation },
            // 'cs-CZ': { translation: csCZTranslation },
            // 'da-DK': { translation: daDKTranslation },
            // 'de-DE': { translation: deDETranslation },
            // 'es-ES': { translation: esESTranslation },
            // 'fr-FR': { translation: frFRTranslation },
            // 'it-IT': { translation: itITTranslation },
            // 'ja-JP': { translation: jaJPTranslation },
            // 'ko-KR': { translation: koKRTranslation },
            // 'nb-NO': { translation: nbNOTranslation },
            'nl-NL': { translation: nlNLTranslation },
            // 'pl-PL': { translation: plPLTranslation },
            // 'pt-BR': { translation: ptBRTranslation },
            // 'sv-SE': { translation: svSETranslation },
            // 'th-TH': { translation: thTHTranslation },
            // 'tr-TR': { translation: trTRTranslation },
            // 'zh-CN': { translation: zhCNTranslation },
            // 'zh-TW': { translation: zhTWTranslation },
        },
        fallbackLng: 'en',

        interpolation: {
            escapeValue: false,
        },

        lng: 'en',
    });

export default i18n;