import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtocolUpgradeProposalsListItem } from './protocol-upgrade-proposals-list-item';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import type { ProtocolUpgradeProposalFieldsFragment } from '../../proposals/__generated__/ProtocolUpgradeProposals';

const proposal = {
  status:
    ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
  vegaReleaseTag: 'v1.0.0',
  upgradeBlockHeight: '12345',
} as ProtocolUpgradeProposalFieldsFragment;

describe('ProtocolUpgradeProposalsListItem', () => {
  it('renders nothing when no proposal is passed', () => {
    render(<ProtocolUpgradeProposalsListItem />);
    const listItem = screen.queryByTestId(
      'protocol-upgrade-proposals-list-item'
    );
    expect(listItem).not.toBeInTheDocument();
  });

  it('renders the correct status icon for each proposal status', () => {
    const statuses = [
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED,
        icon: 'protocol-upgrade-proposal-status-icon-rejected',
      },
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
        icon: 'protocol-upgrade-proposal-status-icon-pending',
      },
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED,
        icon: 'protocol-upgrade-proposal-status-icon-approved',
      },
      {
        status:
          ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED,
        icon: 'protocol-upgrade-proposal-status-icon-unspecified',
      },
    ];

    statuses.forEach(({ status, icon }, index) => {
      render(
        <ProtocolUpgradeProposalsListItem
          proposal={{ ...proposal, status }}
          key={index}
        />
      );
      const statusIcon = screen.getByTestId(icon);
      expect(statusIcon).toBeInTheDocument();
    });
  });

  it('renders the correct Vega release tag', () => {
    render(<ProtocolUpgradeProposalsListItem proposal={proposal} />);
    const releaseTag = screen.getByTestId(
      'protocol-upgrade-proposal-release-tag'
    );
    expect(releaseTag).toHaveTextContent(proposal.vegaReleaseTag);
  });

  it('renders the correct upgrade block height', () => {
    render(<ProtocolUpgradeProposalsListItem proposal={proposal} />);
    const blockHeight = screen.getByTestId(
      'protocol-upgrade-proposal-block-height'
    );
    expect(blockHeight).toHaveTextContent(proposal.upgradeBlockHeight);
  });
});
