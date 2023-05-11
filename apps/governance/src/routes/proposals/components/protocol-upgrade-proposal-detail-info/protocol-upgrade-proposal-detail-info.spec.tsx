// jest tests for the protocol upgrade proposal detail info component

import { render } from '@testing-library/react';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import { ProtocolUpgradeProposalDetailInfo } from './protocol-upgrade-proposal-detail-info';

const renderComponent = () =>
  render(
    <ProtocolUpgradeProposalDetailInfo
      proposal={{
        vegaReleaseTag: 'v0.1.234',
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
        upgradeBlockHeight: '12345',
        approvers: [],
      }}
    />
  );

describe('ProtocolUpgradeProposalDetailInfo', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the upgrade block height', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('protocol-upgrade-block-height')).toHaveTextContent(
      '12345'
    );
  });

  it('should render the state', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('protocol-upgrade-state')).toHaveTextContent(
      'Waiting for validator votes'
    );
  });

  it('should render the vega release tag', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('protocol-upgrade-release-tag')).toHaveTextContent(
      'v0.1.234'
    );
  });
});
