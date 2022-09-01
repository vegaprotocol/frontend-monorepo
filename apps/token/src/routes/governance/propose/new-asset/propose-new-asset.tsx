import { useTranslation } from 'react-i18next';
import {
  ProposalFormDescription,
  ProposalFormMinRequirements,
  ProposalFormReference,
  ProposalFormSubmit,
  ProposalFormTerms,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  useProposalSubmit,
} from '@vegaprotocol/governance';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useForm } from 'react-hook-form';
import type { ProposalNewAssetTerms } from '@vegaprotocol/wallet';

export interface NewAssetProposalFormFields {
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

export const ProposeNewAsset = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NewAssetProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const onSubmit = async (fields: NewAssetProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newAsset: {
          ...JSON.parse(fields.proposalTerms),
        },
      } as ProposalNewAssetTerms,
    });
  };

  return (
    <>
      <Heading title={t('NewAssetProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements />
            <div data-testid="new-asset-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                <ProposalFormTitle
                  registerField={register('proposalTitle', {
                    required: t('Required'),
                  })}
                  errorMessage={errors?.proposalTitle?.message}
                />

                <ProposalFormDescription
                  registerField={register('proposalDescription', {
                    required: t('Required'),
                  })}
                  errorMessage={errors?.proposalDescription?.message}
                />

                <ProposalFormTerms
                  registerField={register('proposalTerms', {
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
                  errorMessage={errors?.proposalTerms?.message}
                />

                <ProposalFormReference
                  registerField={register('proposalReference')}
                  errorMessage={errors?.proposalReference?.message}
                />

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
