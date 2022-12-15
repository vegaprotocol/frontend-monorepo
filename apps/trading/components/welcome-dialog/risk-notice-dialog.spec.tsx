import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Networks, EnvironmentProvider } from '@vegaprotocol/environment';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { WelcomeDialog } from './welcome-dialog';

const mockEnvDefinitions = {
  VEGA_CONFIG_URL: 'https://config.url',
  VEGA_URL: 'https://test.url',
  VEGA_NETWORKS: JSON.stringify({}),
};

describe('Risk notice dialog', () => {
  const introText = 'Regulation may apply to use of this app';
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
          <MockedProvider>
            <WelcomeDialog />
          </MockedProvider>
        </EnvironmentProvider>,
        { wrapper: BrowserRouter }
      );

      if (assertion === 'displays') {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.queryByText(introText)).toBeInTheDocument();
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.queryByText(introText)).not.toBeInTheDocument();
      }
    }
  );

  it("doesn't display the risk notice when previously acknowledged", () => {
    render(
      <EnvironmentProvider
        definitions={{ ...mockEnvDefinitions, VEGA_ENV: Networks.MAINNET }}
        config={{ hosts: [] }}
      >
        <RiskNoticeDialog onClose={mockOnClose} />
      </EnvironmentProvider>
    );

    expect(screen.queryByText(introText)).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: 'I understand, Continue',
    });
    fireEvent.click(button);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
