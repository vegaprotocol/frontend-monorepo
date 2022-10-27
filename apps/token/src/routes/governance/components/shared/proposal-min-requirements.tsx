import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';

export enum ProposalUserAction {
  CREATE = 'CREATE',
  VOTE = 'VOTE',
}

interface ProposalFormMinRequirementsProps {
  minProposalBalance: string;
  spamProtectionMin: string;
  userAction: ProposalUserAction.CREATE | ProposalUserAction.VOTE;
}

// Returns the larger, formatted value of the two token amounts
export const ProposalMinRequirements = ({
  minProposalBalance,
  spamProtectionMin,
  userAction,
}: ProposalFormMinRequirementsProps) => {
  const { t } = useTranslation();
  const minProposalBalanceFormatted = new BigNumber(
    addDecimal(minProposalBalance, 18)
  );
  const spamProtectionMinFormatted = new BigNumber(
    addDecimal(spamProtectionMin, 18)
  );

  const larger =
    minProposalBalanceFormatted > spamProtectionMinFormatted
      ? minProposalBalanceFormatted
      : spamProtectionMinFormatted;

  return (
    <div className="mb-4" data-testid="min-proposal-requirements">
      {userAction === ProposalUserAction.CREATE &&
        t('MinProposalRequirements', { value: Number(larger) })}
      {userAction === ProposalUserAction.VOTE &&
        t('MinProposalVoteRequirements', { value: Number(larger) })}
    </div>
  );
};
