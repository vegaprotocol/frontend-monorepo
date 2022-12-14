import { useTranslation } from 'react-i18next';
import { Button } from '@vegaprotocol/ui-toolkit';

interface ProposalFormSubmitProps {
  isSubmitting: boolean;
}

export const ProposalFormSubmit = ({
  isSubmitting,
}: ProposalFormSubmitProps) => {
  const { t } = useTranslation();
  return (
    <div className="mt-10 my-20">
      <Button
        variant="primary"
        type="submit"
        data-testid="proposal-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('Submitting') : t('Submit')} {t('Proposal')}
      </Button>
    </div>
  );
};
