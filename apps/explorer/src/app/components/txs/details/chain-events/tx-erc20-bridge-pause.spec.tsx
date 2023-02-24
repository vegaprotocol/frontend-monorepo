import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/utils';
import { TxDetailsChainEventErc20BridgePause } from './tx-erc20-bridge-pause';

describe('Chain Event: ERC20 bridge pause', () => {
  it('Renders pause if paused', () => {
    const screen = render(
      <table>
        <tbody>
          <TxDetailsChainEventErc20BridgePause isPaused={true} />
        </tbody>
      </table>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(screen.getByText(t('ERC20 bridge pause'))).toBeInTheDocument();
  });

  it('Renders unpause if resumed', () => {
    const screen = render(
      <table>
        <tbody>
          <TxDetailsChainEventErc20BridgePause isPaused={false} />
        </tbody>
      </table>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(screen.getByText(t('ERC20 bridge unpause'))).toBeInTheDocument();
  });
});
