import { render } from '@testing-library/react';
import { ProposeFreeform } from './propose-freeform';
import { NetworkLoader } from '@vegaprotocol/environment';
import { createClient } from '../../../../lib/apollo-client';

const renderComponent = () =>
  render(
    <NetworkLoader createClient={createClient}>
      <ProposeFreeform />
    </NetworkLoader>
  );

describe('ProposeFreeform', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });
});
