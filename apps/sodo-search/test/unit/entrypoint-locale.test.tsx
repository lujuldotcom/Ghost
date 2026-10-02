import { act, waitFor } from '@testing-library/preact';
import { useEffect, useState } from 'preact/hooks';

const appLifecycle = vi.hoisted(() => ({
  mounts: 0,
  unmounts: 0,
  locales: [] as Array<string | undefined>,
}));

// The entrypoint is checked against a stand-in App: the real App runtime
// behavior and state preservation are covered by the runtime-locale acceptance test.
vi.mock('../../src/app', () => ({
  default: function StubApp({ locale }: { locale?: string }) {
    const [instanceId] = useState(() => String(Math.random()));

    useEffect(() => {
      appLifecycle.mounts += 1;
      return () => {
        appLifecycle.unmounts += 1;
      };
    }, []);

    useEffect(() => {
      appLifecycle.locales.push(locale);
    }, [locale]);

    return <span data-instance={instanceId} data-locale={locale} data-testid="stub-app" />;
  },
}));

describe('Sodo Search entrypoint locale contract', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  test('forwards runtime data-locale changes without remounting the App', async () => {
    const script = document.createElement('script');
    script.dataset.sodoSearch = 'http://localhost:3000';
    script.dataset.key = 'key';
    script.dataset.locale = 'en';
    document.head.appendChild(script);

    await act(async () => {
      await import('../../src/index');
    });

    const stub = document.querySelector('[data-testid="stub-app"]');
    expect(stub).toHaveAttribute('data-locale', 'en');
    const instanceId = stub!.getAttribute('data-instance');

    await act(async () => {
      script.dataset.locale = 'fr';
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    });

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
    expect(document.querySelectorAll('#sodo-search-root')).toHaveLength(1);
    expect(document.querySelectorAll('[data-testid="stub-app"]')).toHaveLength(1);

    expect(appLifecycle.mounts).toBe(1);
    expect(appLifecycle.unmounts).toBe(0);
    expect(appLifecycle.locales).toEqual(['en', 'fr']);
  });
});
