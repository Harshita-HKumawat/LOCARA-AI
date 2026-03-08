
import { useLanguageStore } from "../store/useLanguageStore";
import { translations, TranslationKeys } from "../lib/translations";

export const useTranslation = () => {
    const { language } = useLanguageStore();

    const t = (key: TranslationKeys): string => {
        return translations[language][key] || translations.EN[key] || key;
    };

    return { t, language };
};
