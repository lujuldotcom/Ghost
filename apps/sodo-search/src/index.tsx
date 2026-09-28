import './index.css';
import App from './app';
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

function getSiteData(): SiteData {
  const scriptTag = document.querySelector<HTMLElement>('script[data-sodo-search]');
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
  const { adminUrl, apiKey, stylesUrl, locale, outfitRegularUrl, outfitBoldUrl } = getSiteData();
  const adminBaseUrl = (adminUrl || window.location.origin).replace(/\/+$/, '');
  render(
    <App
      adminUrl={adminBaseUrl}
      apiKey={apiKey}
      locale={locale}
      outfitBoldUrl={outfitBoldUrl}
      outfitRegularUrl={outfitRegularUrl}
      stylesUrl={stylesUrl}
    />,
    addRootDiv(),
  );
}

init();
