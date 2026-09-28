import {
  getOfferData,
  getSiteData,
  getProductData,
  getPriceData,
} from '../../../../src/utils/fixtures-generator';
import { render } from '../../../utils/test-utils';
import OfferPage from '../../../../src/components/pages/offer-page';

const setup = (overrides) => {
  const { mockDoActionFn, ...utils } = render(<OfferPage />, {
    overrideContext: {
      member: null,
      ...overrides,
    },
  });

  return {
    mockDoActionFn,
    ...utils,
  };
};

describe('OfferPage', () => {
  test('sanitizes malicious XSS in signup terms HTML', () => {
    const product = getProductData({
      monthlyPrice: getPriceData({ interval: 'month', amount: 500 }),
      yearlyPrice: getPriceData({ interval: 'year', amount: 5000 }),
    });
    const offer = getOfferData({ tierId: product.id });
    const siteData = getSiteData({
      products: [product],
      membersSignupAccess: 'all',
    });
    siteData.portal_signup_terms_html = "<img src=x onerror=alert('XSS')>";

    const { container } = setup({
      site: siteData,
      pageData: offer,
    });

    const termsContent = container.querySelector('.gh-portal-signup-terms-content');
    expect(termsContent).toBeInTheDocument();
    expect(termsContent.innerHTML).toBe('');
    expect(termsContent.querySelector('img')).toBeNull();
  });

  test('formats offer prices using the Portal locale', () => {
    const product = getProductData({
      monthlyPrice: getPriceData({ interval: 'month', amount: 599, currency: 'eur' }),
      yearlyPrice: getPriceData({ interval: 'year', amount: 5999, currency: 'eur' }),
    });
    const offer = {
      ...getOfferData({ tierId: product.id }),
      type: 'fixed',
      amount: 100,
      currency: 'EUR',
      cadence: 'month',
      duration: 'once',
    };
    const siteData = getSiteData({
      products: [product],
      membersSignupAccess: 'all',
    });

    const { container, getByTestId } = setup({
      site: siteData,
      pageData: offer,
      locale: 'fr',
    });

    const discountLabel = getByTestId('offer-discount-label');
    const updatedPrice = getByTestId('offer-updated-price');
    const updatedAmount = updatedPrice.querySelector('.amount');
    const currencySign = updatedPrice.querySelector('.currency-sign');
    const oldPrice = container.querySelector('.gh-portal-offer-oldprice');
    const offerMessage = getByTestId('offer-message');

    expect(discountLabel.textContent.replace(/\s+/gu, ' ')).toContain('1 €');
    expect(updatedAmount).toHaveTextContent('4,99');
    expect(currencySign).toHaveTextContent('€');
    expect(currencySign.previousElementSibling).toBe(updatedAmount);
    expect(oldPrice.textContent.replace(/\s+/gu, ' ')).toBe('5,99 €');
    expect(offerMessage.textContent.replace(/\s+/gu, ' ')).toContain('5,99 €/month');
  });
});
