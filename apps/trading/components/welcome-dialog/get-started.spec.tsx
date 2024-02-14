import { MemoryRouter } from 'react-router-dom';
import { GetStarted } from './get-started';
import { render, screen, fireEvent } from '@testing-library/react';
import { useOnboardingStore } from './use-get-onboarding-step';
import * as walletHooks from '@vegaprotocol/wallet-react';

jest.mock('@vegaprotocol/wallet-react');

// @ts-ignore type wrong after mock
walletHooks.useVegaWallet.mockReturnValue({
  pubKey: 'my-pubkey',
});

let mockStep = 1;
jest.mock('./use-get-onboarding-step', () => ({
  ...jest.requireActual('./use-get-onboarding-step'),
  useGetOnboardingStep: jest.fn(() => mockStep),
}));

describe('GetStarted', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <GetStarted />
      </MemoryRouter>
    );
  };
  const checkTicks = (elements: Element[]) => {
    elements.forEach((item, i) => {
      if (i + 1 < mockStep - 1) {
        expect(item.querySelector('[data-testid="icon-tick"]')).toBeTruthy();
      }
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders full get started content if not connected and no browser wallet detected', () => {
    renderComponent();
    expect(screen.getByTestId('get-started-banner')).toBeInTheDocument();
  });

  it('renders connect prompt if no pubKey but wallet installed', () => {
    globalThis.window.vega = {} as Vega;
    renderComponent();
    expect(screen.getByTestId('get-started-banner')).toBeInTheDocument();
    globalThis.window.vega = undefined as unknown as Vega;
  });

  it('renders nothing if dismissed', () => {
    useOnboardingStore.setState({ dismissed: true });
    mockStep = 0;
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('steps should be ticked', () => {
    useOnboardingStore.setState({ dismissed: false });
    const navigatorGetter: jest.SpyInstance = jest.spyOn(
      window.navigator,
      'userAgent',
      'get'
    );
    navigatorGetter.mockReturnValue('Chrome');

    mockStep = 2;
    const { rerender, container } = renderComponent();
    checkTicks(screen.getAllByRole('listitem'));
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();

    mockStep = 3;
    rerender(
      <MemoryRouter>
        <GetStarted />
      </MemoryRouter>
    );
    checkTicks(screen.getAllByRole('listitem'));
    expect(screen.getByRole('link', { name: 'Deposit' })).toBeInTheDocument();

    mockStep = 4;
    rerender(
      <MemoryRouter>
        <GetStarted />
      </MemoryRouter>
    );
    checkTicks(screen.getAllByRole('listitem'));
    expect(
      screen.getByRole('link', { name: 'Ready to trade' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Ready to trade' }));

    mockStep = 5;
    rerender(
      <MemoryRouter>
        <GetStarted />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
