import { afterEach, describe, expect, test } from 'vitest';
import i18n, { t } from '../../../src/utils/i18n';

// The lujul public-app build aliases Portal's Ghost i18n registry to an en/fr-only
// registry. Translation assertions ensure French is bundled while other Ghost
// locales fall back to English.
describe('portal i18n', () => {
  afterEach(() => {
    i18n.changeLanguage('en');
  });

  test('serves bundled French translations after changing language', () => {
    i18n.changeLanguage('fr');

    expect(t('Account settings')).toBe('Paramètres du compte');
  });

  test('serves English', () => {
    i18n.changeLanguage('en');

    expect(t('Account settings')).toBe('Account settings');
  });

  test('falls back to English for a Ghost locale not bundled by lujul', () => {
    i18n.changeLanguage('nl');

    expect(t('Account settings')).toBe('Account settings');
  });
});
