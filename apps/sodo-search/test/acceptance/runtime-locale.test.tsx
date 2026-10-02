import App from '../../src/app';
import styles from '../../src/index.css?inline';
import { render } from 'preact';
import { userEvent } from 'vitest/browser';

const FIXTURES: Record<string, object[]> = {
  posts: [{ id: 'post-1', title: 'Hello world', excerpt: '', url: 'https://site.test/hello/' }],
  authors: [],
  tags: [],
};

let container: HTMLElement;
let stylesUrl: string;
let originalHref: string;
let searchIndexFetches: number;

// The entrypoint re-renders the same <App> into the same root when the bootstrap
// script's data-locale changes; renderApp exercises that same props update.
function renderApp(locale: string) {
  render(
    <App adminUrl="https://site.test" apiKey="test-key" locale={locale} stylesUrl={stylesUrl} />,
    container,
  );
}

function popupFrame() {
  return document.querySelector<HTMLIFrameElement>('.gh-root-frame iframe');
}

async function openedPopup() {
  return vi.waitFor(() => {
    const doc = popupFrame()?.contentDocument;
    const input = doc?.querySelector('input');
    if (!doc || !input || doc.activeElement !== input) {
      throw new Error('Search popup is not open and focused');
    }
    return doc;
  });
}

beforeEach(() => {
  originalHref = window.location.href;
  searchIndexFetches = 0;
  stylesUrl = URL.createObjectURL(new Blob([styles], { type: 'text/css' }));
  const originalFetch = window.fetch.bind(window);
  vi.spyOn(window, 'fetch').mockImplementation(async (input, init) => {
    const resource = String(input).match(
      /\/ghost\/api\/content\/search-index\/(\w+)\/\?key=test-key$/,
    )?.[1];
    if (!resource) {
      return originalFetch(input, init);
    }
    searchIndexFetches += 1;
    return Response.json({ [resource]: FIXTURES[resource] });
  });
  document.body.insertAdjacentHTML('beforeend', '<button data-ghost-search>Search</button>');
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  render(null, container);
  container.remove();
  document.querySelector('[data-ghost-search]')?.remove();
  URL.revokeObjectURL(stylesUrl);
  window.history.replaceState(null, '', originalHref);
  vi.restoreAllMocks();
});

test('keeps the bootstrap locale and follows a runtime change without dropping search state', async () => {
  renderApp('en');
  await userEvent.click(document.querySelector('[data-ghost-search]')!);
  const doc = await openedPopup();
  const frame = popupFrame();
  const input = doc.querySelector('input')!;

  expect(input.placeholder).toBe('Search posts, tags and authors');

  await userEvent.keyboard('nothing here');
  await vi.waitFor(() => expect(doc.body.textContent).toContain('No matches found'));
  const fetchCount = searchIndexFetches;

  renderApp('fr');

  await vi.waitFor(() => expect(doc.body.textContent).toContain('Aucun résultat trouvé'));
  expect(input.placeholder).toBe('Rechercher des articles, des catégories et des auteurs');
  expect(frame!.getAttribute('title')).toBe(
    'Rechercher des articles, des catégories et des auteurs',
  );
  expect(doc.documentElement.getAttribute('dir')).toBe('ltr');

  // Same popup frame, same input and query, same populated index: nothing was
  // remounted or fetched again.
  expect(popupFrame()).toBe(frame);
  expect(doc.querySelector('input')).toBe(input);
  expect(input.value).toBe('nothing here');
  expect(searchIndexFetches).toBe(fetchCount);

  // The index built before the change still answers queries.
  await userEvent.keyboard(`${'{Backspace}'.repeat('nothing here'.length)}hello`);
  await vi.waitFor(() => expect(doc.body.textContent).toContain('Articles'));
  expect(doc.body.textContent).toContain('Hello world');

  renderApp('en');
  await vi.waitFor(() => expect(doc.body.textContent).toContain('Posts'));
});
