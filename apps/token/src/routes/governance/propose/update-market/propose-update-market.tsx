import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
} from '@vegaprotocol/governance';
import {
  ProposalFormSubheader,
  ProposalFormMinRequirements,
  ProposalFormTitle,
  ProposalFormDescription,
  ProposalFormTerms,
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormVoteDeadline,
  ProposalFormEnactmentDeadline,
} from '../../components/propose';
import {
  AsyncRenderer,
  FormGroup,
  InputError,
  KeyValueTable,
  KeyValueTableRow,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useNetworkParamWithKeys } from '../../../../hooks/use-network-param';
import { NetworkParams } from '../../../../config';
import type { ProposalUpdateMarketTerms } from '@vegaprotocol/wallet';
import type { ProposalMarketsQuery } from './__generated__/ProposalMarketsQuery';

const MARKETS_QUERY = gql`
  query ProposalMarketsQuery {
    marketsConnection {
      edges {
        node {
          id
          tradableInstrument {
            instrument {
              name
              code
            }
          }
        }
      }
    }
  }
`;

export interface UpdateMarketProposalFormFields {
  proposalVoteDeadline: number;
  proposalEnactmentDeadline: number;
  proposalTitle: string;
  proposalDescription: string;
  proposalMarketId: string;
  proposalTerms: string;
  proposalReference: string;
}

export const ProposeUpdateMarket = () => {
  const {
    data: networkParamsData,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParamWithKeys([
    NetworkParams.GOV_UPDATE_MARKET_MIN_CLOSE,
    NetworkParams.GOV_UPDATE_MARKET_MAX_CLOSE,
    NetworkParams.GOV_UPDATE_MARKET_MIN_ENACT,
    NetworkParams.GOV_UPDATE_MARKET_MAX_ENACT,
    NetworkParams.GOV_UPDATE_MARKET_MIN_PROPOSER_BALANCE,
  ]);

  const {
    data: marketsData,
    loading: marketsLoading,
    error: marketsError,
  } = useQuery<ProposalMarketsQuery>(MARKETS_QUERY);

  const sortedMarkets = useMemo(() => {
    if (!marketsData) {
      return [];
    }

    return marketsData.marketsConnection.edges
      .map((edge) => edge.node)
      .sort((a, b) => {
        const aName = a.tradableInstrument.instrument.name;
        const bName = b.tradableInstrument.instrument.name;

        if (aName < bName) {
          return -1;
        }
        if (aName > bName) {
          return 1;
        }
        return 0;
      });
  }, [marketsData]);

  const minVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_MARKET_MIN_CLOSE
  )?.value;
  const maxVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_MARKET_MAX_CLOSE
  )?.value;
  const minEnactmentDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_MARKET_MIN_ENACT
  )?.value;
  const maxEnactmentDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_MARKET_MAX_ENACT
  )?.value;
  const minProposerBalance = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_MARKET_MIN_PROPOSER_BALANCE
  )?.value;

  const [selectedMarket, setSelectedMarket] = useState<string | undefined>(
    undefined
  );

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
          marketId: fields.proposalMarketId,
          changes: {
            ...JSON.parse(fields.proposalTerms),
          },
        },
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline
        ),
      } as ProposalUpdateMarketTerms,
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading && marketsLoading}
      error={networkParamsError && marketsError}
      data={networkParamsData && marketsData}
    >
      <Heading title={t('UpdateMarketProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements value={minProposerBalance} />
            <div data-testid="update-market-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
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

                <ProposalFormSubheader>
                  {t('SelectAMarketToChange')}
                </ProposalFormSubheader>

                <FormGroup
                  label={t('SelectAMarketToChange')}
                  labelFor="proposal-market"
                  hideLabel={true}
                >
                  <Select
                    id="proposal-market"
                    {...register('proposalMarketId', {
                      required: t('Required'),
                    })}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                  >
                    {sortedMarkets.map((market) => (
                      <option value={market.id} key={market.id}>
                        {market.tradableInstrument.instrument.name}
                      </option>
                    ))}
                  </Select>
                  {errors?.proposalMarketId?.message && (
                    <InputError intent="danger">
                      {errors?.proposalMarketId?.message}
                    </InputError>
                  )}
                </FormGroup>

                {selectedMarket && (
                  <div className="mt-[-20px] mb-6">
                    <KeyValueTable data-testid="update-market-details">
                      <KeyValueTableRow>
                        {t('MarketName')}
                        {
                          marketsData?.marketsConnection?.edges?.find(
                            ({ node: market }) => market.id === selectedMarket
                          )?.node.tradableInstrument.instrument.name
                        }
                      </KeyValueTableRow>
                      <KeyValueTableRow>
                        {t('MarketCode')}
                        {
                          marketsData?.marketsConnection?.edges?.find(
                            ({ node: market }) => market.id === selectedMarket
                          )?.node.tradableInstrument.instrument.code
                        }
                      </KeyValueTableRow>
                      <KeyValueTableRow>
                        {t('MarketId')}
                        {selectedMarket}
                      </KeyValueTableRow>
                    </KeyValueTable>
                  </div>
                )}

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
                  labelOverride={t('ProposeUpdateMarketChanges')}
                  errorMessage={errors?.proposalTerms?.message}
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
    </AsyncRenderer>
  );
};
