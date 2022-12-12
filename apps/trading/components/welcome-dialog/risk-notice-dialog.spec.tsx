import { render, screen, fireEvent } from '@testing-library/react';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { Networks, EnvironmentProvider } from '@vegaprotocol/environment';
import { useGlobalStore } from '../../stores';

beforeEach(() => {
  localStorage.clear();
  useGlobalStore.setState((state) => ({
    ...state,
    riskNoticeDialog: false,
  }));
});

const mockEnvDefinitions = {
  VEGA_CONFIG_URL: 'https://config.url',
  VEGA_URL: 'https://test.url',
  VEGA_NETWORKS: JSON.stringify({}),
};

describe('Risk notice dialog', () => {
  const mockOnClose = jest.fn();
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each`
    assertion             | network
    ${'displays'}         | ${Networks.MAINNET}
    ${'does not display'} | ${Networks.CUSTOM}
    ${'does not display'} | ${Networks.DEVNET}
    ${'does not display'} | ${Networks.STAGNET3}
    ${'does not display'} | ${Networks.TESTNET}
  `(
    '$assertion the risk notice on $network',
    async ({ assertion, network }) => {
      render(
        <EnvironmentProvider
          definitions={{ ...mockEnvDefinitions, VEGA_ENV: network }}
          config={{ hosts: [] }}
        >
          <RiskNoticeDialog onClose={mockOnClose} />
        </EnvironmentProvider>
      );

      if (assertion === 'displays') {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.queryByText('WARNING')).toBeInTheDocument();
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.queryByText('WARNING')).not.toBeInTheDocument();
      }
    }
  );

  it("doesn't display the risk notice when previously acknowledged", () => {
    const { rerender } = render(
      <EnvironmentProvider
        definitions={{ ...mockEnvDefinitions, VEGA_ENV: Networks.MAINNET }}
        config={{ hosts: [] }}
      >
        <RiskNoticeDialog onClose={mockOnClose} />
      </EnvironmentProvider>
    );

    expect(screen.queryByText('WARNING')).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: 'I understand, Continue',
    });
    fireEvent.click(button);

    rerender(
      <EnvironmentProvider
        definitions={{ ...mockEnvDefinitions, VEGA_ENV: Networks.MAINNET }}
        config={{ hosts: [] }}
      >
        <RiskNoticeDialog onClose={mockOnClose} />
      </EnvironmentProvider>
    );

    expect(screen.queryByText('WARNING')).not.toBeInTheDocument();
  });
});
