import { render } from '@testing-library/react';
import { ProposeNewMarket } from './propose-new-market';
import { NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from '../../../../lib/apollo-client';

const renderComponent = () =>
  render(
    <NetworkLoader createClient={createClient}>
      <ProposeNewMarket />
    </NetworkLoader>
  );

describe('ProposeNewMarket', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });
});
