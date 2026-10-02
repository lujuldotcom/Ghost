import { createRef } from 'react';
import App from '../src/app';
import setupGhostApi from '../src/utils/api';
import i18n from '../src/utils/i18n';
import { appRender, fireEvent, waitFor, within } from './utils/test-utils';
import { site as FixtureSite } from './utils/test-fixtures';

// The entrypoint re-renders the same <App> into the same root when the bootstrap
// script's data-locale changes; `rerender` exercises that same props update.
describe('Portal runtime locale', () => {
  const realLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://portal.localhost/#/portal/signin'),
      writable: true,
    });
  });

  afterEach(() => {
    window.location = realLocation;
    vi.restoreAllMocks();
    i18n.changeLanguage('en');
  });

  function setupApi({ site = {}, init } = {}) {
    const ghostApi = setupGhostApi({ siteUrl: 'https://example.com' });
    ghostApi.init =
      init ||
      vi.fn(() => {
        return Promise.resolve({
          site: { ...FixtureSite.singleTier.basic, ...site },
          member: null,
        });
      });
    return ghostApi;
  }

  function renderApp(props) {
    const appRef = createRef();
    const ghostApi = props.api;
    const utils = appRender(<App ref={appRef} siteI18nEnabled={true} {...props} />);
    const rerenderApp = (nextProps) => {
      utils.rerender(<App ref={appRef} siteI18nEnabled={true} api={ghostApi} {...nextProps} />);
    };
    return { ...utils, appRef, rerenderApp };
  }

  async function findPopupDocument(utils) {
    const popupFrame = await utils.findByTitle(/portal-popup/i);
    await within(popupFrame.contentDocument).findByLabelText(/e-?mail/i);
    return { popupFrame, popupDocument: popupFrame.contentDocument };
  }

  test('keeps the bootstrap locale and follows a runtime change from English to French', async () => {
    const ghostApi = setupApi();
    const utils = renderApp({ api: ghostApi, locale: 'en' });
    const { popupFrame, popupDocument } = await findPopupDocument(utils);
    const { appRef } = utils;

    expect(within(popupDocument).getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(appRef.current.state.locale).toBe('en');

    const emailInput = within(popupDocument).getByLabelText(/e-?mail/i);
    fireEvent.change(emailInput, { target: { value: 'reader@example.com' } });
    const changeLanguage = vi.spyOn(i18n, 'changeLanguage');

    utils.rerenderApp({ locale: 'fr' });

    expect(changeLanguage).toHaveBeenCalledWith('fr');
    expect(i18n.language).toBe('fr');
    await within(popupDocument).findByRole('heading', { name: 'Se connecter' });

    const app = appRef.current;
    expect(app.state.locale).toBe('fr');
    expect(app.state.dir).toBe('ltr');
    expect(app.getContextFromState().locale).toBe('fr');
    expect(app.getContextFromState().dir).toBe('ltr');

    // Same instance, same popup, same page and form input: nothing was remounted.
    expect(ghostApi.init).toHaveBeenCalledTimes(1);
    expect(app.state.initStatus).toBe('success');
    expect(app.state.showPopup).toBe(true);
    expect(utils.getByTitle(/portal-popup/i)).toBe(popupFrame);
    expect(within(popupDocument).getByLabelText(/e-?mail/i)).toBe(emailInput);
    expect(emailInput).toHaveValue('reader@example.com');
  });

  test('follows a runtime change from French to English', async () => {
    const ghostApi = setupApi();
    const utils = renderApp({ api: ghostApi, locale: 'fr' });
    const { popupDocument } = await findPopupDocument(utils);

    expect(
      within(popupDocument).getByRole('heading', { name: 'Se connecter' }),
    ).toBeInTheDocument();

    utils.rerenderApp({ locale: 'en' });

    await within(popupDocument).findByRole('heading', { name: 'Sign in' });
    expect(utils.appRef.current.state.locale).toBe('en');
    expect(ghostApi.init).toHaveBeenCalledTimes(1);
  });

  test('converges the text direction, including on the open popup frame', async () => {
    const ghostApi = setupApi();
    const utils = renderApp({ api: ghostApi, locale: 'en' });
    const { popupDocument } = await findPopupDocument(utils);

    expect(popupDocument.documentElement).toHaveAttribute('dir', 'ltr');

    // lujul only bundles left-to-right locales, so the engine's direction is stubbed
    // to check that Portal follows whatever the i18n engine reports.
    vi.spyOn(i18n, 'dir').mockReturnValue('rtl');
    utils.rerenderApp({ locale: 'ar' });

    expect(utils.appRef.current.state.dir).toBe('rtl');
    expect(utils.appRef.current.getContextFromState().dir).toBe('rtl');
    await waitFor(() => {
      expect(popupDocument.documentElement).toHaveAttribute('dir', 'rtl');
    });
  });

  test('resolves a runtime change with the same contract as bootstrap', async () => {
    const ghostApi = setupApi({ site: { locale: 'fr' } });
    const utils = renderApp({ api: ghostApi, locale: 'en' });
    await findPopupDocument(utils);

    // Without a usable locale prop, the already loaded site locale applies.
    utils.rerenderApp({ locale: undefined });
    expect(utils.appRef.current.state.locale).toBe('fr');

    utils.rerenderApp({ locale: 'en' });
    expect(utils.appRef.current.state.locale).toBe('en');
    expect(ghostApi.init).toHaveBeenCalledTimes(1);
  });

  test('stays in English when site i18n is disabled', async () => {
    const ghostApi = setupApi();
    const utils = renderApp({ api: ghostApi, locale: 'en', siteI18nEnabled: false });
    const { popupDocument } = await findPopupDocument(utils);

    utils.rerenderApp({ locale: 'fr', siteI18nEnabled: false });

    expect(utils.appRef.current.state.locale).toBe('en');
    expect(within(popupDocument).getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  test('starts with the latest locale when it changes while bootstrap is in flight', async () => {
    let resolveInit;
    const init = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveInit = resolve;
        }),
    );
    const ghostApi = setupApi({ init });
    const utils = renderApp({ api: ghostApi, locale: 'en' });

    await waitFor(() => expect(init).toHaveBeenCalledTimes(1));
    utils.rerenderApp({ locale: 'fr' });
    expect(utils.appRef.current.state.initStatus).toBe('running');

    resolveInit({ site: FixtureSite.singleTier.basic, member: null });

    const { popupDocument } = await findPopupDocument(utils);
    expect(
      within(popupDocument).getByRole('heading', { name: 'Se connecter' }),
    ).toBeInTheDocument();
    expect(utils.appRef.current.state.locale).toBe('fr');
    expect(i18n.language).toBe('fr');
    expect(init).toHaveBeenCalledTimes(1);
  });
});
