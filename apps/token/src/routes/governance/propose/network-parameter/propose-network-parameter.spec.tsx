import { render } from '@testing-library/react';
import { ProposeNetworkParameter } from './propose-network-parameter';
import { NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from '../../../../lib/apollo-client';

const renderComponent = () =>
  render(
    <NetworkLoader createClient={createClient}>
      <ProposeNetworkParameter />
    </NetworkLoader>
  );

// const mockNetworkParams = [
//   {
//     key: 'governance.proposal.updateNetParam.requiredParticipation',
//     value: '0.3',
//   },
//   {
//     key: 'limits.assets.proposeEnabledFrom',
//     value: '',
//   },
//   {
//     key: 'limits.markets.proposeEnabledFrom',
//     value: '',
//   },
//   {
//     key: 'market.auction.maximumDuration',
//     value: '168h0m0s',
//   },
// ];

describe('ProposeNetworkParameter', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });
});
