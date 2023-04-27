import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { RiskNoticeDialog } from './risk-notice-dialog';
import { WelcomeDialog } from './welcome-dialog';

jest.mock('@vegaprotocol/environment');

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
    assertion     | network
    ${'displays'} | ${Networks.MAINNET}
    ${'displays'} | ${Networks.CUSTOM}
    ${'displays'} | ${Networks.DEVNET}
    ${'displays'} | ${Networks.STAGNET3}
    ${'displays'} | ${Networks.TESTNET}
  `(
    '$assertion the risk notice on $network',
    async ({ assertion, network }) => {
      // @ts-ignore ignore mock implementation
      useEnvironment.mockImplementation(() => ({
        ...mockEnvDefinitions,
        VEGA_ENV: network,
      }));

      render(
        <MockedProvider>
          <WelcomeDialog />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );

      expect(screen.queryByText(introText)).toBeInTheDocument();
    }
  );

  it("doesn't display the risk notice when previously acknowledged", () => {
    // @ts-ignore ignore mock implementation
    useEnvironment.mockImplementation(() => ({
      ...mockEnvDefinitions,
      VEGA_ENV: Networks.MAINNET,
    }));

    render(<RiskNoticeDialog onClose={mockOnClose} />);

    expect(screen.queryByText(introText)).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: 'I understand, Continue',
    });
    fireEvent.click(button);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
