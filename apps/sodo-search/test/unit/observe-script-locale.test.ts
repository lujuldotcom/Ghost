import { afterEach, describe, expect, test, vi } from 'vitest';
import { observeScriptLocale } from '../../src/observe-script-locale';

const flushMutations = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe('observeScriptLocale', () => {
  afterEach(() => {
    document.head.innerHTML = '';
  });

  function createScript(locale: string) {
    const script = document.createElement('script');
    script.setAttribute('data-sodo-search', 'https://example.com');
    script.setAttribute('data-locale', locale);
    document.head.appendChild(script);
    return script;
  }

  test('reports data-locale changes', async () => {
    const script = createScript('en');
    const onLocaleChange = vi.fn();
    observeScriptLocale(script, onLocaleChange);

    script.setAttribute('data-locale', 'fr');
    await flushMutations();
    script.setAttribute('data-locale', 'en');
    await flushMutations();

    expect(onLocaleChange.mock.calls).toEqual([['fr'], ['en']]);
  });

  test('ignores other attributes and unchanged writes', async () => {
    const script = createScript('en');
    const onLocaleChange = vi.fn();
    observeScriptLocale(script, onLocaleChange);

    script.setAttribute('data-key', 'other-key');
    script.setAttribute('data-locale', 'en');
    await flushMutations();

    expect(onLocaleChange).not.toHaveBeenCalled();
  });

  test('reports a removed data-locale as undefined', async () => {
    const script = createScript('fr');
    const onLocaleChange = vi.fn();
    observeScriptLocale(script, onLocaleChange);

    script.removeAttribute('data-locale');
    await flushMutations();

    expect(onLocaleChange).toHaveBeenCalledWith(undefined);
  });

  test('stops reporting once disconnected', async () => {
    const script = createScript('en');
    const onLocaleChange = vi.fn();
    const disconnect = observeScriptLocale(script, onLocaleChange);

    disconnect();
    script.setAttribute('data-locale', 'fr');
    await flushMutations();

    expect(onLocaleChange).not.toHaveBeenCalled();
  });
});
