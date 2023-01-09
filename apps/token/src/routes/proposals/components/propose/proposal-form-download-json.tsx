import { useTranslation } from 'react-i18next';
import { Button } from '@vegaprotocol/ui-toolkit';

interface ProposalFormDownloadJsonProps {
  downloadJson: () => void;
}

export const ProposalFormDownloadJson = ({
  downloadJson,
}: ProposalFormDownloadJsonProps) => {
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      <Button data-testid="proposal-download-json" onClick={downloadJson}>
        {t('downloadProposalJson')}
      </Button>
    </div>
  );
};
