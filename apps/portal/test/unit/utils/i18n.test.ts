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

  test('keeps lujul French Portal wording', () => {
    i18n.changeLanguage('fr');

    expect(t('Choose your newsletters')).toBe("Choisir vos lettres d'information");
    expect(t('Email newsletter')).toBe("Lettre d'information");
    expect(t('Failed to update newsletter settings')).toBe(
      "La mise à jour des paramètres de la lettre d'information a échoué",
    );
    expect(
      t(
        'If the spam complaint was accidental, or you would like to begin receiving emails again, you can resubscribe to emails by clicking the button on the previous screen.',
      ),
    ).toBe(
      'Si le signalement spam était accidentel ou que vous souhaitez de nouveau recevoir les e-mails, vous pourrez vous réinscrire en cliquant sur le bouton de la page précédente.',
    );
    expect(
      t(
        'If you would like to start receiving emails again, the best next steps are to check your email address on file for any issues and then click resubscribe on the previous screen.',
      ),
    ).toBe(
      "Si vous souhaitez à nouveau recevoir les e-mails, le mieux serait de vérifier s'il n'y a pas d'erreurs sur le compte de l'adresse e-mail renseignée, puis de vous réinscrire via la page précédente.",
    );
    expect(t('Occasional updates from {siteTitle}', { siteTitle: 'lujul' })).toBe(
      'Actualités et annonces occasionnelles de lujul',
    );
    expect(t('Updates & announcements')).toBe('Actualités et annonces');

    // "Paid plan" follows lujul's current subscription vocabulary rather than
    // restoring the historical "offre payante" wording.
    expect(t('Sorry, no paid plans are available.')).toBe(
      "Désolé, aucun abonnement payant n'est disponible.",
    );
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
