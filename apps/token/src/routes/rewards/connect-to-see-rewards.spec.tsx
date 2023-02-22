import { render } from '@testing-library/react';
import { AppStateProvider } from '../../contexts/app-state/app-state-provider';
import { ConnectToSeeRewards } from './connect-to-see-rewards';

describe('ConnectToSeeRewards', () => {
  it('should render button correctly', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <ConnectToSeeRewards />
      </AppStateProvider>
    );
    expect(getByTestId('connect-to-vega-wallet-btn')).toBeInTheDocument();
  });

  it('should render the correct text', () => {
    const { getByText } = render(
      <AppStateProvider>
        <ConnectToSeeRewards />
      </AppStateProvider>
    );
    expect(
      getByText('TO SEE YOUR REWARDS, CONNECT YOUR WALLET')
    ).toBeInTheDocument();
  });
});
