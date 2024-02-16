import { MemoryRouter } from 'react-router-dom';
import { MockedWalletProvider, mockConfig } from '@vegaprotocol/wallet-react';
import { GetStarted } from './get-started';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useOnboardingStore } from './use-get-onboarding-step';

let mockStep = 1;
jest.mock('./use-get-onboarding-step', () => ({
  ...jest.requireActual('./use-get-onboarding-step'),
  useGetOnboardingStep: jest.fn(() => mockStep),
}));

describe('GetStarted', () => {
  const renderComponent = () => {
    return (
      <MemoryRouter>
        <MockedWalletProvider>
          <GetStarted />
        </MockedWalletProvider>
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

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  it('renders full get started content if not connected and no browser wallet detected', () => {
    render(renderComponent());
    expect(screen.getByTestId('get-started-banner')).toBeInTheDocument();
  });

  it('renders connect prompt if no pubKey but wallet installed', () => {
    globalThis.window.vega = {} as Vega;
    render(renderComponent());
    expect(screen.getByTestId('get-started-banner')).toBeInTheDocument();
    globalThis.window.vega = undefined as unknown as Vega;
  });

  it('renders nothing if dismissed', () => {
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    useOnboardingStore.setState({ dismissed: true });
    mockStep = 0;
    const { container } = render(renderComponent());
    expect(container).toBeEmptyDOMElement();
  });

  it('steps should be ticked', () => {
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    useOnboardingStore.setState({ dismissed: false });
    const navigatorGetter: jest.SpyInstance = jest.spyOn(
      window.navigator,
      'userAgent',
      'get'
    );
    navigatorGetter.mockReturnValue('Chrome');

    mockStep = 2;
    const { rerender, container } = render(renderComponent());
    checkTicks(screen.getAllByRole('listitem'));
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();

    mockStep = 3;
    rerender(renderComponent());
    checkTicks(screen.getAllByRole('listitem'));
    expect(screen.getByRole('link', { name: 'Deposit' })).toBeInTheDocument();

    mockStep = 4;
    rerender(renderComponent());
    checkTicks(screen.getAllByRole('listitem'));
    expect(
      screen.getByRole('link', { name: 'Ready to trade' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Ready to trade' }));

    mockStep = 5;
    rerender(renderComponent());
    expect(container).toBeEmptyDOMElement();
  });
});
