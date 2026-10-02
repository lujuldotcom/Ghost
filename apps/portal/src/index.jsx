import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import { observeScriptLocale } from './utils/observe-script-locale';

const ROOT_DIV_ID = 'ghost-portal-root';

function addRootDiv() {
  const elem = document.createElement('div');
  elem.id = ROOT_DIV_ID;
  elem.setAttribute('data-testid', 'portal-root');
  document.body.appendChild(elem);
}

function getScriptTag() {
  /**
   * @type {HTMLElement}
   */
  return document.querySelector('script[data-ghost]');
}

function getSiteData(scriptTag) {
  if (scriptTag) {
    const siteI18nEnabled = scriptTag.dataset.i18n === 'true';
    const siteUrl = scriptTag.dataset.ghost;
    const apiKey = scriptTag.dataset.key;
    const apiUrl = scriptTag.dataset.api;
    const locale = scriptTag.dataset.locale; // not providing a fallback here but will do it within the app.
    const outfitRegularUrl = scriptTag.dataset.outfitRegular;
    const outfitBoldUrl = scriptTag.dataset.outfitBold;
    return {
      siteUrl,
      apiKey,
      apiUrl,
      siteI18nEnabled,
      locale,
      outfitRegularUrl,
      outfitBoldUrl,
    };
  }
  return {};
}

function handleTokenUrl() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('token')) {
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.href);
  }
}

function setPreviewTheme() {
  const [, queryString] = window.location.hash.substring(1).split('?');
  const previewTheme = new URLSearchParams(queryString).get('previewTheme');

  if (previewTheme === 'dark') {
    document.documentElement.dataset.portalPreviewTheme = 'dark';
  }
}

function init() {
  const scriptTag = getScriptTag();
  // const customSiteUrl = getSiteUrl();
  const {
    siteUrl: customSiteUrl,
    apiKey,
    apiUrl,
    siteI18nEnabled,
    locale,
    outfitRegularUrl,
    outfitBoldUrl,
  } = getSiteData(scriptTag);
  const siteUrl = customSiteUrl || window.location.origin;

  setPreviewTheme();
  addRootDiv();
  handleTokenUrl();

  const root = document.getElementById(ROOT_DIV_ID);

  // Rendering the same element tree into the same root updates the mounted App's
  // props instead of remounting it, so a locale change keeps Portal's state.
  const renderApp = (appLocale) => {
    ReactDOM.render(
      <React.StrictMode>
        <App
          siteUrl={siteUrl}
          customSiteUrl={customSiteUrl}
          apiKey={apiKey}
          apiUrl={apiUrl}
          siteI18nEnabled={siteI18nEnabled}
          locale={appLocale}
          outfitRegularUrl={outfitRegularUrl}
          outfitBoldUrl={outfitBoldUrl}
        />
      </React.StrictMode>,
      root,
    );
  };

  renderApp(locale);

  if (scriptTag) {
    observeScriptLocale(scriptTag, renderApp);
  }
}

init();
