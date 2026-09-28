import { getCalendarDateString, getSiteDateString } from '../../src/utils/date-time';

describe('getSiteDateString', () => {
  const isoDate = '2030-01-01T01:00:00.000Z';

  test('returns an empty string without a date', () => {
    expect(getSiteDateString(null)).toBe('');
    expect(getSiteDateString(undefined)).toBe('');
  });

  test('returns an empty string for an invalid date', () => {
    expect(getSiteDateString('not-a-date')).toBe('');
  });

  test('formats in the publication locale and timezone', () => {
    expect(getSiteDateString(isoDate, { locale: 'en-GB', timezone: 'America/Los_Angeles' })).toBe(
      '31 Dec 2029',
    );
  });

  test('defaults to en and UTC', () => {
    expect(getSiteDateString(isoDate)).toBe(
      new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Etc/UTC',
      }).format(new Date(isoDate)),
    );
  });

  test('keeps the publication timezone when its locale is not a valid tag', () => {
    expect(getSiteDateString(isoDate, { locale: 'en_US', timezone: 'America/Los_Angeles' })).toBe(
      new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Los_Angeles',
      }).format(new Date(isoDate)),
    );
  });

  test('falls back to UTC when the publication timezone is not a valid zone', () => {
    expect(getSiteDateString(isoDate, { locale: 'en-GB', timezone: 'Not/AZone' })).toBe(
      '1 Jan 2030',
    );
  });

  test('keeps a valid locale when falling back from an invalid timezone', () => {
    expect(getSiteDateString(isoDate, { locale: 'fr', timezone: 'Not/AZone' })).toBe(
      new Intl.DateTimeFormat('fr', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Etc/UTC',
      }).format(new Date(isoDate)),
    );
  });
});

describe('getCalendarDateString', () => {
  test('formats a calendar day using the explicit locale', () => {
    expect(getCalendarDateString('2026-08-03', { locale: 'fr' })).toBe('3 août 2026');
  });

  test('preserves the calendar day independently of timezone conversion', () => {
    expect(getCalendarDateString('2026-08-03', { locale: 'en-GB' })).toBe('3 Aug 2026');
  });

  test('returns an empty string for missing or invalid calendar dates', () => {
    expect(getCalendarDateString(null)).toBe('');
    expect(getCalendarDateString('not-a-date')).toBe('');
    expect(getCalendarDateString('2026-8-3')).toBe('');
    expect(getCalendarDateString('2026-08-03-extra')).toBe('');
    expect(getCalendarDateString('2026-02-31')).toBe('');
  });
});
