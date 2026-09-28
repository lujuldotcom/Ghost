import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useOptions } from '../../../src/utils/options';

const OptionsProbe = ({ scriptTag }: { scriptTag: HTMLElement }) => {
  const options = useOptions(scriptTag);

  return (
    <div data-testid="options" data-locale={options.locale} data-timezone={options.timezone} />
  );
};

describe('useOptions', () => {
  it('reads locale and timezone from the script dataset', () => {
    const scriptTag = document.createElement('script');
    scriptTag.dataset.locale = 'fr';
    scriptTag.dataset.timezone = 'Europe/Paris';

    render(<OptionsProbe scriptTag={scriptTag} />);

    const options = screen.getByTestId('options');
    expect(options).toHaveAttribute('data-locale', 'fr');
    expect(options).toHaveAttribute('data-timezone', 'Europe/Paris');
  });

  it('falls back to English and UTC authorities', () => {
    const scriptTag = document.createElement('script');

    render(<OptionsProbe scriptTag={scriptTag} />);

    const options = screen.getByTestId('options');
    expect(options).toHaveAttribute('data-locale', 'en');
    expect(options).toHaveAttribute('data-timezone', 'Etc/UTC');
  });

  it('reacts when locale and timezone attributes change', async () => {
    const scriptTag = document.createElement('script');
    scriptTag.dataset.locale = 'en';
    scriptTag.dataset.timezone = 'Etc/UTC';

    render(<OptionsProbe scriptTag={scriptTag} />);

    const options = screen.getByTestId('options');
    expect(options).toHaveAttribute('data-locale', 'en');
    expect(options).toHaveAttribute('data-timezone', 'Etc/UTC');

    act(() => {
      scriptTag.dataset.locale = 'fr';
      scriptTag.dataset.timezone = 'Europe/Paris';
    });

    await waitFor(() => {
      expect(options).toHaveAttribute('data-locale', 'fr');
      expect(options).toHaveAttribute('data-timezone', 'Europe/Paris');
    });
  });
});
