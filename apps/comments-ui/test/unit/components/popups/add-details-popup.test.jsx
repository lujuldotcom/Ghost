import AddDetailsPopup from '../../../../src/components/popups/add-details-popup';
import React from 'react';
import { AppContext } from '../../../../src/app-context';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@headlessui/react', () => ({
  Transition: ({ children }) => <>{children}</>,
}));

const renderPopup = () => {
  const context = {
    accentColor: '#000000',
    dispatchAction: vi.fn(),
    member: {
      name: 'John Doe',
      expertise: '',
    },
    t: (str) => str,
  };

  return render(
    <AppContext.Provider value={context}>
      <AddDetailsPopup callback={vi.fn()} />
    </AppContext.Provider>,
  );
};

describe('AddDetailsPopup', () => {
  it('keeps the popup viewport-wide until the 768px breakpoint', () => {
    renderPopup();

    const popup = screen.getByTestId('profile-modal');

    expect(popup).toHaveClass('w-screen');
    expect(popup).toHaveClass('md:w-[720px]');
    expect(popup).not.toHaveClass('sm:w-[720px]');
  });
});
