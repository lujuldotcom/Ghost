// lujul browser registry: bundle only English and French for this public app.
import { i18nFromGlob } from '../esm-factory.ts';

const i18n = i18nFromGlob(
  {
    ...import.meta.glob('../../locales/en/search.json', { eager: true, import: 'default' }),
    ...import.meta.glob('../../locales/fr/search.json', { eager: true, import: 'default' }),
  },
  'search',
);

export default i18n;
export const { LOCALE_DATA, SUPPORTED_LOCALES, generateResources } = i18n;
