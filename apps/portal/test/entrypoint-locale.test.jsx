import { useEffect, useState } from 'react';
import { waitFor } from '@testing-library/react';

const appLifecycle = vi.hoisted(() => ({ mounts: 0, unmounts: 0, locales: [] }));

// The entrypoint is checked against a stand-in App: what matters here is how the
// bootstrap script reaches the mounted component, not Portal's own bootstrap.
vi.mock('../src/app', () => ({
  default: function StubApp({ locale }) {
    const [instanceId] = useState(() => Math.random());
    useEffect(() => {
      appLifecycle.mounts += 1;
      return () => {
        appLifecycle.unmounts += 1;
      };
    }, []);
    useEffect(() => {
      appLifecycle.locales.push(locale);
    }, [locale]);
    return <span data-testid="stub-app" data-instance={instanceId} data-locale={locale} />;
  },
}));

describe('Portal entrypoint locale contract', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  test('forwards runtime data-locale changes to the mounted App without remounting it', async () => {
    const script = document.createElement('script');
    script.dataset.ghost = 'https://example.com';
    script.dataset.i18n = 'true';
    script.dataset.locale = 'en';
    document.head.appendChild(script);

    await import('../src/index.jsx');

    const stub = document.querySelector('[data-testid="stub-app"]');
    expect(stub).toHaveAttribute('data-locale', 'en');
    const instanceId = stub.getAttribute('data-instance');

    script.dataset.locale = 'fr';

    await waitFor(() => {
      expect(document.querySelector('[data-testid="stub-app"]')).toHaveAttribute(
        'data-locale',
        'fr',
      );
    });
    expect(document.querySelector('[data-testid="stub-app"]')).toHaveAttribute(
      'data-instance',
      instanceId,
    );
    expect(document.querySelectorAll('#ghost-portal-root')).toHaveLength(1);
    expect(document.querySelectorAll('[data-testid="stub-app"]')).toHaveLength(1);
    // StrictMode does not double-invoke effects in React 17.
    expect(appLifecycle.mounts).toBe(1);
    expect(appLifecycle.unmounts).toBe(0);
    expect(appLifecycle.locales).toEqual(['en', 'fr']);
  });
});
