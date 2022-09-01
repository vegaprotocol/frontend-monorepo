import { useTranslation } from 'react-i18next';
import {
  ProposalFormMinRequirements,
  ProposalFormSubmitButton,
  ProposalFormTransactionDialog,
  useProposalSubmit,
  ProposalFormTitleField,
} from '@vegaprotocol/governance';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useForm } from 'react-hook-form';
import {
  FormGroup,
  Input,
  InputError,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import type { ProposalUpdateMarketTerms } from '@vegaprotocol/wallet';

export interface UpdateMarketProposalFormFields {
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

export const ProposeUpdateMarket = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<UpdateMarketProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const onSubmit = async (fields: UpdateMarketProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        updateMarket: {
          ...JSON.parse(fields.proposalTerms),
        },
      } as ProposalUpdateMarketTerms,
    });
  };

  return (
    <>
      <Heading title={t('UpdateMarketProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements />
            <div data-testid="update-market-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                <ProposalFormTitleField
                  registerField={register('proposalTitle', {
                    required: t('Required'),
                  })}
                  errorMessage={errors?.proposalTitle?.message}
                />
                <FormGroup
                  label={t('ProposalTitle')}
                  labelFor="proposal-title"
                  labelDescription={t('ProposalTitleText')}
                >
                  <Input
                    id="proposal-title"
                    maxLength={100}
                    hasError={Boolean(errors?.proposalTitle?.message)}
                    data-testid="proposal-title"
                    {...register('proposalTitle', {
                      required: t('Required'),
                    })}
                  />
                  {errors.proposalTitle?.message && (
                    <InputError intent="danger">
                      {errors.proposalTitle.message}
                    </InputError>
                  )}
                </FormGroup>

                <FormGroup
                  label={t('ProposalDescription')}
                  labelFor="proposal-description"
                  labelDescription={t('ProposalDescriptionText')}
                >
                  <TextArea
                    id="proposal-description"
                    maxLength={20000}
                    className="min-h-[200px]"
                    hasError={Boolean(errors?.proposalDescription?.message)}
                    data-testid="proposal-description"
                    {...register('proposalDescription', {
                      required: t('Required'),
                    })}
                  />
                  {errors.proposalDescription?.message && (
                    <InputError intent="danger">
                      {errors.proposalDescription.message}
                    </InputError>
                  )}
                </FormGroup>

                <FormGroup label={t('ProposalTerms')} labelFor="proposal-terms">
                  <TextArea
                    id="proposal-terms"
                    className="min-h-[200px]"
                    hasError={Boolean(errors?.proposalTerms?.message)}
                    data-testid="proposal-terms"
                    {...register('proposalTerms', {
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
                  {errors.proposalTerms?.message && (
                    <InputError intent="danger">
                      {errors.proposalTerms.message}
                    </InputError>
                  )}
                </FormGroup>

                <FormGroup
                  label={t('ProposalReference')}
                  labelFor="proposal-reference"
                >
                  <Input
                    id="proposal-reference"
                    maxLength={100}
                    hasError={Boolean(errors?.proposalReference?.message)}
                    data-testid="proposal-reference"
                    {...register('proposalReference')}
                  />
                  {errors.proposalReference?.message && (
                    <InputError intent="danger">
                      {errors.proposalReference.message}
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
