import { fireEvent, render, screen } from '@testing-library/react';

import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { locators, ReceiptWrapper } from './receipt-wrapper';

jest.mock('@/stores/assets-store');
jest.mock('@/stores/markets-store');

describe('ReceiptView', () => {
  it('should render vega section, title and children', () => {
    mockStore(useAssetsStore, {});
    mockStore(useMarketsStore, {});
    render(
      <ReceiptWrapper>
        <div>Child</div>
      </ReceiptWrapper>
    );
    expect(screen.getByTestId(locators.receiptWrapper)).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('should render notification when an error is passed in and not render children', () => {
    mockStore(useAssetsStore, {});
    mockStore(useMarketsStore, {});
    render(
      <ReceiptWrapper errors={[new Error('Some error')]}>
        <div>Child</div>
      </ReceiptWrapper>
    );
    expect(
      screen.getByTestId(locators.receiptWrapperError)
    ).toBeInTheDocument();
    expect(screen.getByTestId(locators.receiptWrapperError)).toHaveTextContent(
      'Error loading data'
    );
    expect(screen.getByTestId(locators.receiptWrapperError)).toHaveTextContent(
      'Additional data to display your transaction could not be loaded. The transaction can still be sent, but only transaction data can be shown.'
    );
    expect(screen.getByTestId(locators.receiptWrapperError)).toHaveTextContent(
      'Copy error message(s)'
    );
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('should render notification if there was a problem loading assets', () => {
    mockStore(useAssetsStore, { error: new Error('Some error') });
    mockStore(useMarketsStore, { error: null });
    render(
      <ReceiptWrapper errors={[]}>
        <div>Child</div>
      </ReceiptWrapper>
    );
    expect(
      screen.getByTestId(locators.receiptWrapperError)
    ).toBeInTheDocument();
  });

  it('should render notification if there was a problem loading markets', () => {
    mockStore(useAssetsStore, { error: null });
    mockStore(useMarketsStore, { error: new Error('Some error') });
    render(
      <ReceiptWrapper errors={[]}>
        <div>Child</div>
      </ReceiptWrapper>
    );
    expect(
      screen.getByTestId(locators.receiptWrapperError)
    ).toBeInTheDocument();
  });

  it('allows you to copy all errors', () => {
    const writeText = jest.fn();
    const error1 = new Error('1');
    const error2 = new Error('2');
    const error3 = new Error('3');
    // @ts-ignore
    global.navigator.clipboard = {
      writeText,
    };
    mockStore(useAssetsStore, { error: error1 });
    mockStore(useMarketsStore, { error: error2 });
    render(
      <ReceiptWrapper errors={[error3]}>
        <div>Child</div>
      </ReceiptWrapper>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith(
      [error1.stack, error2.stack, error3.stack].join('. \n')
    );
  });
});
