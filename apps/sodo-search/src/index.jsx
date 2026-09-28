import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './app';

const ROOT_DIV_ID = 'sodo-search-root';

function addRootDiv() {
  const elem = document.createElement('div');
  elem.id = ROOT_DIV_ID;
  document.body.appendChild(elem);
}

function getSiteData() {
  /**
   * @type {HTMLElement}
   */
  const scriptTag = document.querySelector('script[data-sodo-search]');
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

function setup() {
  addRootDiv();
}

function init() {
  const { adminUrl, apiKey, stylesUrl, locale, outfitRegularUrl, outfitBoldUrl } = getSiteData();
  const adminBaseUrl = (adminUrl || window.location.origin)?.replace(/\/+$/, '');
  setup();
  ReactDOM.render(
    <React.StrictMode>
      <App
        adminUrl={adminBaseUrl}
        apiKey={apiKey}
        stylesUrl={stylesUrl}
        locale={locale}
        outfitRegularUrl={outfitRegularUrl}
        outfitBoldUrl={outfitBoldUrl}
      />
    </React.StrictMode>,
    document.getElementById(ROOT_DIV_ID),
  );
}

init();
