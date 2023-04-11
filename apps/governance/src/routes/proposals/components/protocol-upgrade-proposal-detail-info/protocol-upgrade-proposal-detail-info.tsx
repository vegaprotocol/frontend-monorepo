import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import type { ProtocolUpgradeProposalFieldsFragment } from '../../protocol-upgrade/__generated__/ProtocolUpgradeProposals';

export interface ProtocolUpgradeProposalDetailInfoProps {
  proposal: ProtocolUpgradeProposalFieldsFragment;
  lastBlockHeight?: string;
}

export const ProtocolUpgradeProposalDetailInfo = ({
  proposal,
  lastBlockHeight,
}: ProtocolUpgradeProposalDetailInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-10">
      <SubHeading title={t('PROPOSAL')} />
      <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
        <KeyValueTable data-testid="protocol-upgrade-proposal-details">
          <KeyValueTableRow>
            <span>{t('UPGRADE BLOCK HEIGHT')}</span>

            <span data-testid="protocol-upgrade-block-height">
              {proposal.upgradeBlockHeight}{' '}
              {lastBlockHeight && (
                <>
                  ({t('currently')} {lastBlockHeight})
                </>
              )}
            </span>
          </KeyValueTableRow>

          <KeyValueTableRow>
            <span>{t('STATE')}</span>

            <span data-testid="protocol-upgrade-state">
              {t(`${proposal.status}`)}
            </span>
          </KeyValueTableRow>

          <KeyValueTableRow noBorder={true}>
            <span>{t('VEGA RELEASE TAG')}</span>

            <span data-testid="protocol-upgrade-release-tag">
              {proposal.vegaReleaseTag}
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>
    </div>
  );
};
