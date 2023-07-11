// jest tests for the protocol upgrade proposal detail info component

import { render } from '@testing-library/react';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import { ProtocolUpgradeProposalDetailInfo } from './protocol-upgrade-proposal-detail-info';

const PROPOSAL = {
  vegaReleaseTag: 'v0.1.234',
  status:
    ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
  upgradeBlockHeight: '12345',
  approvers: [],
};

const renderComponent = (lastBlockHeight?: string, time?: string) =>
  render(
    <ProtocolUpgradeProposalDetailInfo
      proposal={PROPOSAL}
      lastBlockHeight={lastBlockHeight}
      time={time}
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

  it('should display estimated time if proposal is still pending', () => {
    const { getByTestId } = renderComponent('12', 'time');
    expect(getByTestId('protocol-upgrade-time-label')).toHaveTextContent(
      'Estimated time to upgrade'
    );
    expect(getByTestId('protocol-upgrade-time')).toHaveTextContent('time');
  });

  it('should display upgraded at if proposal is done', () => {
    const { getByTestId } = renderComponent('123456', 'time');
    expect(getByTestId('protocol-upgrade-time-label')).toHaveTextContent(
      'Upgraded at'
    );
    expect(getByTestId('protocol-upgrade-time')).toHaveTextContent('time');
  });

  it('should not display time if none provided', () => {
    const { queryByTestId } = renderComponent('123456', undefined);
    expect(
      queryByTestId('protocol-upgrade-time-label')
    ).not.toBeInTheDocument();
    expect(queryByTestId('protocol-upgrade-time')).not.toBeInTheDocument();
  });
});
