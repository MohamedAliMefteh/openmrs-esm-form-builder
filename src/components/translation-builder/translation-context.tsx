import { type Schema } from '@types';
import React, { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';

export interface Translation {
  uuid: string;
  form: string;
  description: string;
  language: string;
  translations: Record<string, string>;
}

interface TranslationContextType {
  translations: Translation[];
  getLanguages: () => { language: string; code: string }[];
  addOrUpdateTranslation: (languageCode: string, label: string, translation: string) => void;
  getTranslation: (languageCode: string, label: string) => string;
  saveTranslations: (translations: Translation[]) => void;
}

export const languages: Record<string, string> = {
  Afrikaans: 'af',
  Albanian: 'sq',
  Amharic: 'am',
  Arabic: 'ar',
  Armenian: 'hy',
  Azerbaijani: 'az',
  Basque: 'eu',
  Belarusian: 'be',
  Bengali: 'bn',
  Bosnian: 'bs',
  Bulgarian: 'bg',
  Catalan: 'ca',
  Chinese: 'zh',
  Croatian: 'hr',
  Czech: 'cs',
  Danish: 'da',
  Dutch: 'nl',
  English: 'en',
  Estonian: 'et',
  Filipino: 'tl',
  Finnish: 'fi',
  French: 'fr',
  Galician: 'gl',
  Georgian: 'ka',
  German: 'de',
  Greek: 'el',
  Gujarati: 'gu',
  Hebrew: 'he',
  Hindi: 'hi',
  Hungarian: 'hu',
  Icelandic: 'is',
  Indonesian: 'id',
  Irish: 'ga',
  Italian: 'it',
  Japanese: 'ja',
  Kannada: 'kn',
  Kazakh: 'kk',
  Khmer: 'km',
  Korean: 'ko',
  Lao: 'lo',
  Latvian: 'lv',
  Lithuanian: 'lt',
  Macedonian: 'mk',
  Malay: 'ms',
  Malayalam: 'ml',
  Maltese: 'mt',
  Maori: 'mi',
  Marathi: 'mr',
  Mongolian: 'mn',
  Nepali: 'ne',
  Norwegian: 'no',
  Persian: 'fa',
  Polish: 'pl',
  Portuguese: 'pt',
  Punjabi: 'pa',
  Romanian: 'ro',
  Russian: 'ru',
  Serbian: 'sr',
  Sinhala: 'si',
  Slovak: 'sk',
  Slovenian: 'sl',
  Spanish: 'es',
  Swahili: 'sw',
  Swedish: 'sv',
  Tamil: 'ta',
  Telugu: 'te',
  Thai: 'th',
  Turkish: 'tr',
  Ukrainian: 'uk',
  Urdu: 'ur',
  Uzbek: 'uz',
  Vietnamese: 'vi',
  Welsh: 'cy',
  Xhosa: 'xh',
  Yiddish: 'yi',
  Yoruba: 'yo',
  Zulu: 'zu',
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{
  children: ReactNode;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  initialtranslations?: Translation[];
}> = ({ children, schema, onSchemaChange }) => {
  const STORAGE_KEY = 'formTranslations';
  const [translations, setTranslations] = useState<Translation[]>(null);
  useEffect(() => {
    try {
      const storedTranslations = localStorage.getItem(STORAGE_KEY);
      if (!storedTranslations) return;

      const parsedTranslations: Translation[] = JSON.parse(storedTranslations);
      const translationsForThisForm = parsedTranslations.filter((translation) => translation.uuid === schema?.uuid);

      setTranslations(translationsForThisForm.length > 0 ? translationsForThisForm : null);
    } catch (error) {
      console.error('Failed to parse stored translations', error);
    }
  }, [schema]);

  const saveTranslations = useCallback((translations: Translation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
    } catch (error) {
      console.error('Failed to save translations to localStorage', error);
    }
  }, []);

  const getLanguages = useCallback((): { language: string; code: string }[] => {
    return Object.entries(languages).map(([language, code]) => ({
      language,
      code,
    }));
  }, []);

  const addOrUpdateTranslation = useCallback((languageCode: string, label: string, translation: string) => {
    setTranslations((prev) => {
      const langTranslation = prev.find((t) => t.language === languageCode) || {
        uuid: crypto.randomUUID(),
        form: 'Form',
        description: `Translations for ${languageCode}`,
        language: languageCode,
        translations: {},
      };

      const updated = {
        ...langTranslation,
        translations: {
          ...langTranslation.translations,
          [label]: translation,
        },
      };

      return prev.some((t) => t.language === languageCode)
        ? prev.map((t) => (t.language === languageCode ? updated : t))
        : [...prev, updated];
    });
  }, []);

  const getTranslation = useCallback(
    (languageCode: string, label: string) => {
      const translation = translations?.find((t) => t.language === languageCode);

      if (!translation || !translation.translations) {
        return 'No Available translation';
      }

      const normalizedTranslations = Object.fromEntries(
        Object.entries(translation.translations).map(([key, value]) => [key.toLowerCase(), value]),
      );

      return normalizedTranslations[label.toLowerCase()] || 'No Available translation';
    },
    [translations],
  );

  return (
    <TranslationContext.Provider
      value={{
        translations,
        getLanguages,
        addOrUpdateTranslation,
        getTranslation,
        saveTranslations,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useQuestionTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
