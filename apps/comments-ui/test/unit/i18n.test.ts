import i18nLib from '@tryghost/i18n/registry/comments';
import { describe, expect, it } from 'vitest';

// The lujul public-app build aliases Comments' Ghost i18n registry to an en/fr-only
// registry. Other Ghost locales fall back to English.
describe('comments-ui i18n', () => {
  it('serves bundled French translations', () => {
    const i18n = i18nLib('fr', 'comments');

    expect(i18n.t('Anonymous')).toBe('Anonyme');
  });

  it('serves English', () => {
    const i18n = i18nLib('en', 'comments');

    expect(i18n.t('Anonymous')).toBe('Anonymous');
  });

  it('falls back to English for a Ghost locale not bundled by lujul', () => {
    const i18n = i18nLib('nl', 'comments');

    expect(i18n.t('Anonymous')).toBe('Anonymous');
  });
});
