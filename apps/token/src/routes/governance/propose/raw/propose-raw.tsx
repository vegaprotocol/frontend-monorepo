import { useTranslation } from 'react-i18next';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { FormGroup, InputError, TextArea } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import {
  ProposalFormMinRequirements,
  useProposalSubmit,
} from '@vegaprotocol/governance';
import {
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
} from '@vegaprotocol/governance';

export interface RawProposalFormFields {
  rawProposalData: string;
}

export const ProposeRaw = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RawProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const hasError = Boolean(errors.rawProposalData?.message);

  const onSubmit = async (fields: RawProposalFormFields) => {
    await submit(JSON.parse(fields.rawProposalData));
  };

  return (
    <>
      <Heading title={t('RawProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements />
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
                    {...register('rawProposalData', {
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
                  {errors.rawProposalData?.message && (
                    <InputError intent="danger">
                      {errors.rawProposalData?.message}
                    </InputError>
                  )}
                </FormGroup>
                <ProposalFormSubmit isSubmitting={isSubmitting} />
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
