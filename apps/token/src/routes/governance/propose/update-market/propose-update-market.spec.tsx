import { render } from '@testing-library/react';
import { ProposeUpdateMarket } from './propose-update-market';
import { NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from '../../../../lib/apollo-client';

const renderComponent = () =>
  render(
    <NetworkLoader createClient={createClient}>
      <ProposeUpdateMarket />
    </NetworkLoader>
  );

describe('ProposeUpdateMarket', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });
});
