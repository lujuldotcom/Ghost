import i18nLib from '@tryghost/i18n/registry/search';

// The lujul public-app build aliases Search's Ghost i18n registry to an en/fr-only
// registry. Both bundled locales are left-to-right; other Ghost locales fall back
// to English and therefore remain left-to-right.
describe('sodo-search i18n', () => {
  it('serves bundled French translations', () => {
    const i18n = i18nLib('fr', 'search');

    expect(i18n.dir()).toBe('ltr');
    expect(i18n.t('No matches found')).toBe('Aucun résultat trouvé');
  });

  it('serves English', () => {
    const i18n = i18nLib('en', 'search');

    expect(i18n.dir()).toBe('ltr');
    expect(i18n.t('No matches found')).toBe('No matches found');
  });

  it('falls back to English for a Ghost locale not bundled by lujul', () => {
    const i18n = i18nLib('nl', 'search');

    expect(i18n.dir()).toBe('ltr');
    expect(i18n.t('No matches found')).toBe('No matches found');
  });
});
