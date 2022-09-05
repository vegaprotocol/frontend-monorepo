import { useTranslation } from 'react-i18next';

interface ProposalFormMinRequirementsProps {
  value?: string;
}

export const ProposalFormMinRequirements = ({
  value = '1',
}: ProposalFormMinRequirementsProps) => {
  const { t } = useTranslation();
  return (
    <p className="mb-4">{`${t('MinProposalRequirements1')} ${value} ${t(
      'MinProposalRequirements2'
    )}`}</p>
  );
};
