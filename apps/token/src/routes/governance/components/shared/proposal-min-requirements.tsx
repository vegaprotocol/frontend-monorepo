import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';

interface ProposalFormMinRequirementsProps {
  minProposalBalance: string;
  spamProtectionMin: string;
  userAction: 'create' | 'vote';
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
      {userAction === 'create' &&
        t('MinProposalRequirements', { value: Number(larger) })}
      {userAction === 'vote' &&
        t('MinProposalVoteRequirements', { value: Number(larger) })}
    </div>
  );
};
