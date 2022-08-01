import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, TextArea, Button } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../components/heading';

export const Propose = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const onProposalSubmission = () => {
    setIsSubmitting(true);
  };
  return (
    <>
      <Heading title={t('NewProposal')} />
      <p>{t('MinProposalRequirements')}</p>
      <FormGroup
        label="Make a proposal by submitting JSON in the textarea below"
        labelFor="proposal-text"
        labelClassName="sr-only"
      >
        <TextArea id="proposal-text" />
        <Button variant="primary" type="submit" onSubmit={onProposalSubmission}>
          {isSubmitting ? t('submitting') : t('submit')} {t('proposal')}
        </Button>
      </FormGroup>
    </>
  );
};
