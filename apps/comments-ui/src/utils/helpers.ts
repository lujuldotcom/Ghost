import type { Comment, Member, TranslationFunction } from '../app-context';

// Canonical source for comment permalink hash format
export const COMMENT_HASH_PREFIX = 'ghost-comments-';

// Fragment-only on purpose: the browser resolves these against the live page
// URL, keeping thread navigation a reload-free hashchange even after the page
// URL changes (e.g. Portal scrubbing auth params via history.replaceState).
export function buildCommentPermalink(commentId: string): string {
  return `#${COMMENT_HASH_PREFIX}${commentId}`;
}

// Absolute link for sharing outside the page. Drops the query string so
// member-specific params (e.g. from newsletter links) aren't passed along.
export function buildCommentShareUrl(commentId: string, pageUrl: string): string {
  const url = new URL(pageUrl);
  url.search = '';
  url.hash = buildCommentPermalink(commentId);
  return url.toString();
}

export function buildCommentsRootPermalink(): string {
  return '#ghost-comments';
}

export function parseCommentIdFromHash(hash: string): string | null {
  const regex = new RegExp(`^#${COMMENT_HASH_PREFIX}([a-f0-9]+)$`, 'i');
  const match = hash.match(regex);
  return match ? match[1] : null;
}

export function flattenComments(comments: Comment[]): Comment[] {
  return comments.flatMap((comment) => [comment, ...(comment.replies || [])]);
}

export const MOBILE_MAX_THREAD_DEPTH = 3;
export const DESKTOP_MAX_THREAD_DEPTH = 4;
// Note, this should be the same as breakpoint defined in Tailwind config
export const MOBILE_BREAKPOINT = 480;

export function findCommentById(comments: Comment[], id: string): Comment | undefined {
  return (
    comments.find((comment) => comment?.id === id) ||
    comments.flatMap((comment) => comment.replies || []).find((reply) => reply?.id === id)
  );
}

export function formatNumber(number: number): string {
  if (number !== 0 && !number) {
    return '';
  }

  // Adds in commas for separators
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const DEFAULT_DATE_LOCALE = 'en';
const DEFAULT_TIMEZONE = 'Etc/UTC';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type DateFormattingAuthorities = {
  locale: string;
  timezone: string;
};

type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

function resolveDateFormattingAuthorities(
  locale: string = DEFAULT_DATE_LOCALE,
  timezone: string = DEFAULT_TIMEZONE,
): DateFormattingAuthorities {
  const requestedLocale = locale || DEFAULT_DATE_LOCALE;
  const requestedTimezone = timezone || DEFAULT_TIMEZONE;

  const candidates: Array<[string, string]> = [
    [requestedLocale, requestedTimezone],
    [DEFAULT_DATE_LOCALE, requestedTimezone],
    [requestedLocale, DEFAULT_TIMEZONE],
    [DEFAULT_DATE_LOCALE, DEFAULT_TIMEZONE],
  ];

  for (const [candidateLocale, candidateTimezone] of candidates) {
    try {
      new Intl.DateTimeFormat(candidateLocale, { timeZone: candidateTimezone }).format();
      return {
        locale: candidateLocale,
        timezone: candidateTimezone,
      };
    } catch {
      // Try the next locale/timezone combination.
    }
  }

  return {
    locale: DEFAULT_DATE_LOCALE,
    timezone: DEFAULT_TIMEZONE,
  };
}

function getCalendarDateParts(date: Date, timezone: string): CalendarDateParts {
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value);
  };

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
  };
}

function getCivilDayNumber(parts: CalendarDateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY;
}

export function formatRelativeTime(
  dateString: string,
  t: TranslationFunction,
  locale: string = DEFAULT_DATE_LOCALE,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = new Date(dateString);
  const now = new Date();

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return t('Just now');
  }

  // Up to an hour ago, show relative time
  const secondsDiff = Math.round((now.getTime() - date.getTime()) / 1000);
  if (secondsDiff < 60) {
    return t('Just now');
  }

  const minutesDiff = Math.round(secondsDiff / 60);
  if (minutesDiff === 1) {
    return t('One min ago');
  }

  if (minutesDiff < 60) {
    return t('{amount} mins ago', { amount: minutesDiff });
  }

  const hoursDiff = Math.round(minutesDiff / 60);
  if (hoursDiff === 1) {
    return t('One hour ago');
  }

  const authorities = resolveDateFormattingAuthorities(locale, timezone);
  const dateParts = getCalendarDateParts(date, authorities.timezone);
  const nowParts = getCalendarDateParts(now, authorities.timezone);
  const dayDiff = getCivilDayNumber(nowParts) - getCivilDayNumber(dateParts);

  if (dayDiff === 1) {
    return t('Yesterday');
  }

  if (dayDiff > 1) {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: authorities.timezone,
      day: 'numeric',
      month: 'short',
    };

    if (dateParts.year !== nowParts.year) {
      options.year = 'numeric';
    }

    return new Intl.DateTimeFormat(authorities.locale, options).format(date);
  }

  // We're not older than yesterday, so show relative hours
  return t('{amount} hrs ago', { amount: hoursDiff });
}

export function formatExplicitTime(
  dateString: string,
  locale: string = DEFAULT_DATE_LOCALE,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  const authorities = resolveDateFormattingAuthorities(locale, timezone);

  return new Intl.DateTimeFormat(authorities.locale, {
    timeZone: authorities.timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getInitials(name: string): string {
  if (!name) {
    return '';
  }
  const parts = name.split(' ');

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0].substring(0, 1).toLocaleUpperCase();
  }

  return (
    parts[0].substring(0, 1).toLocaleUpperCase() +
    parts[parts.length - 1].substring(0, 1).toLocaleUpperCase()
  );
}

export function getMemberName(member: Member | null, t: TranslationFunction) {
  if (!member) {
    return t('Deleted member');
  }

  if (!member.name) {
    return t('Anonymous');
  }

  return member.name;
}

export function getMemberNameFromComment(comment: Comment, t: TranslationFunction) {
  return getMemberName(comment.member, t);
}

export function getMemberInitialsFromComment(comment: Comment, t: TranslationFunction) {
  return getInitials(getMemberName(comment.member, t));
}

// Rudimentary check for screen width
// Note, this should be the same as breakpoint defined in Tailwind config
export function isMobile() {
  return (
    Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < MOBILE_BREAKPOINT
  );
}

export function isCommentPublished(comment: Comment) {
  return comment.status === 'published';
}

/**
 * Returns the y scroll position (top) of the main window of a given element that is in one or multiple stacked iframes
 */
export const getScrollToPosition = (element: HTMLElement) => {
  let yOffset = 0;

  // Because we are working in an iframe, we need to resolve the position inside this iframe to the position in the top window
  // Get the window of the element, not the window (which is the top window)
  let currentWindow: Window | null = element.ownerDocument.defaultView;

  // Loop all iframe parents (if we have multiple)
  while (currentWindow && currentWindow !== window) {
    const currentParentWindow = currentWindow.parent;
    for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
      if (currentParentWindow.frames[idx] === currentWindow) {
        for (const frameElement of currentParentWindow.document.getElementsByTagName('iframe')) {
          if (frameElement.contentWindow === currentWindow) {
            const rect = frameElement.getBoundingClientRect();
            yOffset += rect.top + currentWindow.pageYOffset;
          }
        }
        currentWindow = currentParentWindow;
        break;
      }
    }
  }

  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
  return y;
};

const getCenterScrollPosition = (element: HTMLElement) => {
  const yMin = getScrollToPosition(element);
  const yMax = yMin + element.offsetHeight;
  const yCenter = (yMin + yMax) / 2;

  return yCenter - window.innerHeight / 2;
};

/**
 * Scroll to an element that is in an iframe, only if it is outside the current viewport
 */
export const scrollToElement = (element: HTMLElement) => {
  // Is the form already in view?
  const elementHeight = element.offsetHeight;

  // Start y position of the form
  const yMin = getScrollToPosition(element);

  // Y position of the end of the form
  const yMax = yMin + elementHeight;

  // Trigger scrolling when yMin and yMax is closer than this to the border of the viewport
  const offset = 64;

  const viewportHeight = window.innerHeight;
  const viewPortYMin = window.scrollY;
  const viewPortYMax = viewPortYMin + viewportHeight;

  if (yMin - offset < viewPortYMin || yMax + offset > viewPortYMax) {
    // Center the form in the viewport
    window.scrollTo({
      top: getCenterScrollPosition(element),
      left: 0,
      behavior: 'smooth',
    });
  }
};

export const scrollToElementInstantly = (element: HTMLElement) => {
  window.scrollTo({
    top: getCenterScrollPosition(element),
    left: 0,
    behavior: 'auto',
  });
};

export function getCommentInReplyToSnippet(comment: { html?: string | null }): string {
  const html = comment.html ?? '';

  // It would be nicer to use DOMParser here so we can use `innerText` instead
  // of `textContent` to have a more native "visible content" implementation.
  // However, we can't test that because JSDOM doesn't support `innerText`
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Strip non-visible elements (rough innerText proxy)
  tempDiv
    .querySelectorAll('script, style, link, meta, noscript, title')
    .forEach((el) => el.remove());

  // Remove blockquotes to avoid showing content that was quoted from a previous comment,
  // we want the snippet to contain unique content from the comment being replied to
  tempDiv.querySelectorAll('blockquote').forEach((el) => el.remove());

  let text = tempDiv.textContent || '';

  text = text.replace(/\s+/g, ' ');
  text = text.trim();

  return text.substring(0, 100);
}
