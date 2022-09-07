import { useTranslation } from 'react-i18next';
import { addDecimal } from '@vegaprotocol/react-helpers';

interface ProposalFormMinRequirementsProps {
  minProposerBalance: string | undefined;
  spamProtectionMin: string | undefined;
}

export const ProposalFormMinRequirements = ({
  minProposerBalance = '1',
  spamProtectionMin,
}: ProposalFormMinRequirementsProps) => {
  const { t } = useTranslation();
  const minProposerBalanceFormatted = addDecimal(minProposerBalance, 18);
  const spamProtectionMinFormatted =
    spamProtectionMin && addDecimal(spamProtectionMin, 18, 0);
  const largestValue =
    spamProtectionMinFormatted &&
    spamProtectionMinFormatted > minProposerBalanceFormatted
      ? spamProtectionMinFormatted
      : minProposerBalanceFormatted;
  return (
    <p className="mb-4">{`${t('MinProposalRequirements1')} ${largestValue} ${t(
      'MinProposalRequirements2'
    )}`}</p>
  );
};
