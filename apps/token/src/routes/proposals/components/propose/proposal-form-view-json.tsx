import { useTranslation } from 'react-i18next';
import { Button } from '@vegaprotocol/ui-toolkit';

interface ProposalFormViewJsonProps {
  viewJson: () => void;
}

export const ProposalFormViewJson = ({
  viewJson,
}: ProposalFormViewJsonProps) => {
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      <Button data-testid="proposal-view-json" onClick={viewJson}>
        {t('viewProposalJson')}
      </Button>
    </div>
  );
};
