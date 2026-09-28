import { afterEach, describe, expect, test, vi } from 'vitest';
import GiftEmailPreview from '../../../../src/components/common/gift-email-preview';
import { render } from '../../../utils/test-utils';

const defaultProps = {
  recipientName: 'Taylor',
  recipientEmail: 'taylor@example.com',
  buyerName: 'Jamie',
  giftMessage: 'Enjoy!',
  deliveryDate: '2099-08-03',
  isScheduled: true,
  cadence: 'month',
  duration: 3,
  tierName: 'Premium',
  benefits: [],
  siteTitle: 'Example',
  siteIcon: null,
};

afterEach(() => {
  vi.useRealTimers();
});

describe('GiftEmailPreview dates', () => {
  test('formats a scheduled delivery day using the effective Portal locale', () => {
    const { getByText } = render(<GiftEmailPreview {...defaultProps} />, {
      overrideContext: {
        locale: 'fr',
        site: {
          timezone: 'Europe/Paris',
        },
      },
    });

    expect(getByText('3 août 2099')).toBeInTheDocument();
  });

  test('uses the publication timezone to determine today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T01:00:00.000Z'));

    const { container } = render(
      <GiftEmailPreview {...defaultProps} deliveryDate="2029-12-31" isScheduled={false} />,
      {
        overrideContext: {
          locale: 'en-GB',
          site: {
            timezone: 'America/Los_Angeles',
          },
        },
      },
    );

    const activeDate = container.querySelector('.gh-portal-gift-email-date[data-active="true"]');
    expect(activeDate).toHaveTextContent('31 Dec 2029');
  });
});
