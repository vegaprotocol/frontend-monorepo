import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { type ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import * as Types from '@vegaprotocol/types';
import type { ReactNode } from 'react';

export interface ProtocolUpgradeProposalDetailInfoProps {
  proposal: ProtocolUpgradeProposalFieldsFragment;
  lastBlockHeight?: string;
  time?: string | ReactNode;
}

export const ProtocolUpgradeProposalDetailInfo = ({
  proposal,
  lastBlockHeight,
  time,
}: ProtocolUpgradeProposalDetailInfoProps) => {
  const { t } = useTranslation();

  const shouldShowUpgradeTime =
    ![
      Types.ProtocolUpgradeProposalStatus
        .PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED,
      Types.ProtocolUpgradeProposalStatus
        .PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED,
    ].includes(proposal.status) && time;

  const pending = Number(proposal.upgradeBlockHeight) > Number(lastBlockHeight);

  return (
    <div className="mb-10">
      <SubHeading title={t('proposal')} />
      <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
        <KeyValueTable data-testid="protocol-upgrade-proposal-details">
          <KeyValueTableRow>
            <span className="uppercase">{t('upgradeBlockHeight')}</span>

            <span data-testid="protocol-upgrade-block-height">
              {proposal.upgradeBlockHeight}{' '}
              {lastBlockHeight && (
                <span className="text-vega-light-300 dark:text-vega-dark-300">
                  ({t('currently')} {lastBlockHeight})
                </span>
              )}
            </span>
          </KeyValueTableRow>

          {shouldShowUpgradeTime && (
            <KeyValueTableRow>
              <span
                data-testid="protocol-upgrade-time-label"
                className="uppercase"
              >
                {pending ? t('Estimated time to upgrade') : t('Upgraded at')}
              </span>

              <span data-testid="protocol-upgrade-time">{time}</span>
            </KeyValueTableRow>
          )}

          <KeyValueTableRow>
            <span className="uppercase">{t('state')}</span>

            <span data-testid="protocol-upgrade-state">
              {t(`${proposal.status}`)}
            </span>
          </KeyValueTableRow>

          <KeyValueTableRow noBorder={true}>
            <span className="uppercase">{t('vegaReleaseTag')}</span>

            <span data-testid="protocol-upgrade-release-tag">
              {proposal.vegaReleaseTag}
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>
    </div>
  );
};
