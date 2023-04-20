import { render } from '@testing-library/react';
import { ProtocolUpgradeProposalDetailHeader } from './protocol-upgrade-proposal-detail-header';

describe('ProtocolUpgradeProposalDetailHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ProtocolUpgradeProposalDetailHeader releaseTag="v1.0.0" />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render the release tag', () => {
    const { getByText } = render(
      <ProtocolUpgradeProposalDetailHeader releaseTag="v1.0.0" />
    );
    expect(getByText('Vega Release v1.0.0')).toBeTruthy();
  });
});
