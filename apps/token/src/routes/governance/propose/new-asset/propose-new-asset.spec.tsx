import { render } from '@testing-library/react';
import { ProposeNewAsset } from './propose-new-asset';
import { NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from '../../../../lib/apollo-client';

const renderComponent = () =>
  render(
    <NetworkLoader createClient={createClient}>
      <ProposeNewAsset />
    </NetworkLoader>
  );

describe('ProposeNewAsset', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });
});
