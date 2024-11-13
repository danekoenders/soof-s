import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";

try {
  i18next.use(Backend).init({
    fallbackLng: "en",
    preload: ["en"],
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}.json"),
    },
    initImmediate: false,
  });
} catch (error) {
  throw new Error(`Error initializing i18next: ${error.message}`);
}

export async function translate({ isoCode, key }) {
  if (!i18next.hasResourceBundle(isoCode, "translation")) {
    try {
      await i18next.loadLanguages(isoCode);
    } catch (error) {
      return key; // Return the key if loading fails
    }
  }

  return i18next.t(key, { lng: isoCode });
}
