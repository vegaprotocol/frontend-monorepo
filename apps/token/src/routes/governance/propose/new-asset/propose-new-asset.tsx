import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
} from '@vegaprotocol/governance';
import {
  ProposalFormMinRequirements,
  ProposalFormTitle,
  ProposalFormDescription,
  ProposalFormTerms,
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormVoteDeadline,
  ProposalFormEnactmentDeadline,
  ProposalFormSubheader,
} from '../../components/propose';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useNetworkParamWithKeys } from '../../../../hooks/use-network-param';
import { NetworkParams } from '../../../../config';
import type { ProposalNewAssetTerms } from '@vegaprotocol/wallet';

export interface NewAssetProposalFormFields {
  proposalVoteDeadline: number;
  proposalEnactmentDeadline: number;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

export const ProposeNewAsset = () => {
  const {
    data: networkParamsData,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParamWithKeys([
    NetworkParams.GOV_ASSET_MIN_CLOSE,
    NetworkParams.GOV_ASSET_MAX_CLOSE,
    NetworkParams.GOV_ASSET_MIN_ENACT,
    NetworkParams.GOV_ASSET_MAX_ENACT,
    NetworkParams.GOV_ASSET_MIN_PROPOSER_BALANCE,
  ]);

  const minVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_ASSET_MIN_CLOSE
  )?.value;
  const maxVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_ASSET_MAX_CLOSE
  )?.value;
  const minEnactmentDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_ASSET_MIN_ENACT
  )?.value;
  const maxEnactmentDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_ASSET_MAX_ENACT
  )?.value;
  const minProposerBalance = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_ASSET_MIN_PROPOSER_BALANCE
  )?.value;

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
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline
        ),
      } as ProposalNewAssetTerms,
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={networkParamsData}
    >
      <Heading title={t('NewAssetProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements value={minProposerBalance} />
            <div data-testid="new-asset-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                <ProposalFormSubheader>
                  {t('ProposalRationale')}
                </ProposalFormSubheader>

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

                <ProposalFormSubheader>{t('NewAsset')}</ProposalFormSubheader>

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

                <ProposalFormSubheader>
                  {t('ProposalVoteAndEnactmentTitle')}
                </ProposalFormSubheader>

                <ProposalFormVoteDeadline
                  register={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  errorMessage={errors?.proposalVoteDeadline?.message}
                  minClose={minVoteDeadline as string}
                  maxClose={maxVoteDeadline as string}
                />

                <div className="mt-[-10px]">
                  <ProposalFormEnactmentDeadline
                    register={register('proposalEnactmentDeadline', {
                      required: t('Required'),
                    })}
                    errorMessage={errors?.proposalEnactmentDeadline?.message}
                    minEnact={minEnactmentDeadline as string}
                    maxEnact={maxEnactmentDeadline as string}
                  />
                </div>

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
    </AsyncRenderer>
  );
};
