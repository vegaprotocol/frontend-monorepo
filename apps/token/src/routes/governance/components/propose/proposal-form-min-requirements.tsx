import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';

interface ProposalFormMinRequirementsProps {
  minProposerBalance: string | undefined;
  spamProtectionMin: string | undefined;
}

export const ProposalFormMinRequirements = ({
  minProposerBalance,
  spamProtectionMin,
}: ProposalFormMinRequirementsProps) => {
  const { t } = useTranslation();
  const minProposerBalanceFormatted =
    minProposerBalance && new BigNumber(addDecimal(minProposerBalance, 18));
  const spamProtectionMinFormatted =
    spamProtectionMin && new BigNumber(addDecimal(spamProtectionMin, 18));

  const larger =
    Number(minProposerBalanceFormatted) > (spamProtectionMinFormatted || 0)
      ? minProposerBalanceFormatted
      : spamProtectionMinFormatted;

  return (
    <p className="mb-4">{`${t('MinProposalRequirements1')} ${larger} ${t(
      'MinProposalRequirements2'
    )}`}</p>
  );
};
