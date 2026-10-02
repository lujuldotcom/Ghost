import './index.css';
import App from './app';
import { observeScriptLocale } from './observe-script-locale';
import { render } from 'preact';

const ROOT_DIV_ID = 'sodo-search-root';

type SiteData = {
  adminUrl?: string;
  apiKey?: string;
  stylesUrl?: string;
  locale?: string;
  outfitRegularUrl?: string;
  outfitBoldUrl?: string;
};

function addRootDiv() {
  const elem = document.createElement('div');
  elem.id = ROOT_DIV_ID;
  document.body.appendChild(elem);
  return elem;
}

function getScriptTag() {
  return document.querySelector<HTMLElement>('script[data-sodo-search]');
}

function getSiteData(scriptTag: HTMLElement | null): SiteData {
  if (scriptTag) {
    const adminUrl = scriptTag.dataset.sodoSearch;
    // secretlint-disable-next-line @secretlint/secretlint-rule-pattern
    const apiKey = scriptTag.dataset.key;
    const stylesUrl = scriptTag.dataset.styles;
    const locale = scriptTag.dataset.locale || 'en';
    const outfitRegularUrl = scriptTag.dataset.outfitRegular;
    const outfitBoldUrl = scriptTag.dataset.outfitBold;
    return { adminUrl, apiKey, stylesUrl, locale, outfitRegularUrl, outfitBoldUrl };
  }
  return {};
}

function init() {
  const scriptTag = getScriptTag();
  const { adminUrl, apiKey, stylesUrl, locale, outfitRegularUrl, outfitBoldUrl } =
    getSiteData(scriptTag);
  const adminBaseUrl = (adminUrl || window.location.origin).replace(/\/+$/, '');
  const root = addRootDiv();

  // Rendering the same element tree into the same root updates the mounted App's
  // props instead of remounting it, so a locale change keeps the popup, query and
  // search index.
  const renderApp = (appLocale: string | undefined) => {
    render(
      <App
        adminUrl={adminBaseUrl}
        apiKey={apiKey}
        locale={appLocale}
        outfitBoldUrl={outfitBoldUrl}
        outfitRegularUrl={outfitRegularUrl}
        stylesUrl={stylesUrl}
      />,
      root,
    );
  };

  renderApp(locale);

  if (scriptTag) {
    observeScriptLocale(scriptTag, (nextLocale) => renderApp(nextLocale || 'en'));
  }
}

init();
