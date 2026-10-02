// The theme may rewrite `data-locale` on the bootstrap script after Portal has
// mounted. Only that attribute is observed, so other script mutations cannot
// re-render Portal, and repeated writes of the same value are ignored.
export function observeScriptLocale(scriptTag, onLocaleChange) {
  let locale = scriptTag.dataset.locale;

  const observer = new MutationObserver(() => {
    const nextLocale = scriptTag.dataset.locale;
    if (nextLocale !== locale) {
      locale = nextLocale;
      onLocaleChange(nextLocale);
    }
  });

  observer.observe(scriptTag, {
    attributes: true,
    attributeFilter: ['data-locale'],
  });

  return () => observer.disconnect();
}
