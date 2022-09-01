import { useTranslation } from 'react-i18next';
import {
  ProposalFormSubmitButton,
  ProposalFormTransactionDialog,
  useProposalSubmit,
} from '@vegaprotocol/governance';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useForm } from 'react-hook-form';
import { FormGroup, InputError, TextArea } from '@vegaprotocol/ui-toolkit';
import type { ProposalFreeformTerms } from '@vegaprotocol/wallet';

export interface FreeformProposalFormFields {
  proposalTitle: string;
  proposalDescription: string;
}

export const ProposeFreeform = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FreeformProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const onSubmit = async (fields: FreeformProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newFreeform: {},
      },
    });
  };

  return (
    <>
      <Heading title={t('NewFreeformProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <p>{t('MinProposalRequirements')}</p>
            <div data-testid="raw-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormGroup
                  label="Make a proposal by submitting JSON"
                  labelFor="proposal-data"
                >
                  <TextArea
                    id="proposal-data"
                    className="min-h-[200px]"
                    hasError={hasError}
                    data-testid="proposal-data"
                    {...register('proposalData', {
                      required: t('Required'),
                      validate: {
                        validateJson: (value) => {
                          try {
                            JSON.parse(value);
                            return true;
                          } catch (e) {
                            return t('Must be valid JSON');
                          }
                        },
                      },
                    })}
                  />
                  {errors.proposalData?.message && (
                    <InputError intent="danger">
                      {errors.proposalData?.message}
                    </InputError>
                  )}
                </FormGroup>
                <ProposalFormSubmitButton isSubmitting={isSubmitting} />
                <ProposalFormTransactionDialog
                  finalizedProposal={finalizedProposal}
                  TransactionDialog={TransactionDialog}
                />
              </form>
            </div>
          </>
        )}
      </VegaWalletContainer>
    </>
  );
};
