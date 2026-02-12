export { fr, type TranslationKeys } from './translations/fr';
export { en } from './translations/en';
export { es } from './translations/es';

export type Language = 'fr' | 'en' | 'es';

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const defaultLanguage: Language = 'fr';
