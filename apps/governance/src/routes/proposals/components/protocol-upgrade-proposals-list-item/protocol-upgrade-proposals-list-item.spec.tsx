import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtocolUpgradeProposalsListItem } from './protocol-upgrade-proposals-list-item';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';

const proposal = {
  status:
    ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
  vegaReleaseTag: 'v1.0.0',
  upgradeBlockHeight: '12345',
} as ProtocolUpgradeProposalFieldsFragment;

const renderComponent = (proposal: ProtocolUpgradeProposalFieldsFragment) =>
  render(
    <BrowserRouter>
      <ProtocolUpgradeProposalsListItem proposal={proposal} />
    </BrowserRouter>
  );

describe('ProtocolUpgradeProposalsListItem', () => {
  it('renders the correct status icon for each proposal status', () => {
    const statuses = [
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED,
        icon: 'protocol-upgrade-proposal-status-icon-rejected',
        text: 'Declined by validators',
      },
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
        icon: 'protocol-upgrade-proposal-status-icon-pending',
        text: 'Waiting for validator votes',
      },
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED,
        icon: 'protocol-upgrade-proposal-status-icon-approved',
        text: 'Approved by validators',
      },
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED,
        icon: 'protocol-upgrade-proposal-status-icon-unspecified',
        text: 'Unspecified',
      },
    ];

    statuses.forEach(({ status, icon, text }) => {
      renderComponent({ ...proposal, status });
      const statusIcon = screen.getByTestId(icon);
      const textContent = screen.getByText(text);
      expect(statusIcon).toBeInTheDocument();
      expect(textContent).toBeInTheDocument();
    });
  });

  it('renders the correct Vega release tag', () => {
    renderComponent(proposal);
    const releaseTag = screen.getByTestId(
      'protocol-upgrade-proposal-release-tag'
    );
    expect(releaseTag).toHaveTextContent(proposal.vegaReleaseTag);
  });

  it('renders the correct upgrade block height', () => {
    renderComponent(proposal);
    const blockHeight = screen.getByTestId(
      'protocol-upgrade-proposal-block-height'
    );
    expect(blockHeight).toHaveTextContent(proposal.upgradeBlockHeight);
  });
});
