import { useTranslation } from 'react-i18next';
import {
  RoundedWrapper,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { ValidatorDetailsLink } from '../../../home';
import { getNormalisedVotingPower } from '../../../staking/shared';
import type { NodesFragmentFragment } from '../../../staking/home/__generated__/Nodes';

export interface ProtocolUpdateProposalDetailApprovalsProps {
  totalConsensusValidators: number;
  // Consensus validators that have approved the proposal
  consensusApprovals: NodesFragmentFragment[];
  consensusApprovalsVotingPowerPercentage: string;
}

export const ProtocolUpdateProposalDetailApprovals = ({
  totalConsensusValidators,
  consensusApprovals,
  consensusApprovalsVotingPowerPercentage,
}: ProtocolUpdateProposalDetailApprovalsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-10">
        <SubHeading title={t('approvalStatus')} />
        <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
          <KeyValueTable data-testid="protocol-upgrade-approval-status">
            <KeyValueTableRow noBorder={true}>
              <span>{`${consensusApprovalsVotingPowerPercentage} ${t(
                'approval (% validator voting power)'
              )}`}</span>
              <span>({t('67% voting power required')})</span>
            </KeyValueTableRow>
          </KeyValueTable>
        </RoundedWrapper>
      </div>

      <div className="mb-10">
        <SubHeading
          title={`${t('approvers')} (${
            consensusApprovals.length
          }/${totalConsensusValidators} validators)`}
        />
        <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
          <KeyValueTable data-testid="protocol-upgrade-approvers">
            <KeyValueTableRow>
              <div className="mb-2">{t('validator')}</div>
              <div className="text-white mb-2">{t('votingPower')}</div>
            </KeyValueTableRow>

            {consensusApprovals.map((validator, index) => (
              <KeyValueTableRow
                noBorder={index === consensusApprovals?.length - 1}
                key={validator.pubkey}
              >
                <div
                  className="-mb-3 mt-1"
                  data-testid={`validator-${validator.id}`}
                >
                  <ValidatorDetailsLink
                    id={validator.id}
                    avatarUrl={validator.avatarUrl}
                    name={validator.name}
                  />
                </div>

                <span>
                  {getNormalisedVotingPower(
                    validator.rankingScore.votingPower,
                    2
                  )}
                </span>
              </KeyValueTableRow>
            ))}
          </KeyValueTable>
        </RoundedWrapper>
      </div>
    </>
  );
};
