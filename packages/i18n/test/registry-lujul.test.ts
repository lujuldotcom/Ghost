import assert from 'node:assert/strict';

import { describe, it } from 'vitest';

import commentsI18n from '../src/registry-lujul/comments.ts';
import portalI18n from '../src/registry-lujul/portal.ts';
import searchI18n from '../src/registry-lujul/search.ts';

describe('lujul public-app i18n registries', function () {
  it('bundles French Portal translations and falls back to English for other Ghost locales', function () {
    assert.equal(portalI18n.namespace, 'portal');
    assert.equal(portalI18n('fr', 'portal').t('Account settings'), 'Paramètres du compte');
    assert.equal(portalI18n('nl', 'portal').t('Account settings'), 'Account settings');
  });

  it('bundles French Search translations and falls back to English for other Ghost locales', function () {
    assert.equal(searchI18n.namespace, 'search');
    assert.equal(searchI18n('fr', 'search').t('No matches found'), 'Aucun résultat trouvé');
    assert.equal(searchI18n('nl', 'search').t('No matches found'), 'No matches found');
  });

  it('bundles French Comments translations and falls back to English for other Ghost locales', function () {
    assert.equal(commentsI18n.namespace, 'comments');
    assert.equal(commentsI18n('fr', 'comments').t('Anonymous'), 'Anonyme');
    assert.equal(commentsI18n('nl', 'comments').t('Anonymous'), 'Anonymous');
  });
});
