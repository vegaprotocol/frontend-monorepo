import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  getClosingTimestamp,
  getEnactmentTimestamp,
  useProposalSubmit,
  deadlineToRoundedHours,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  NetworkParams,
  useNetworkParams,
  validateJson,
} from '@vegaprotocol/react-helpers';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormSubmit,
  ProposalFormTerms,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import {
  AsyncRenderer,
  FormGroup,
  InputError,
  KeyValueTable,
  KeyValueTableRow,
  Link,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import type { ProposalMarketsQuery } from './__generated__/ProposalMarketsQuery';
import { ProposalUserAction } from '@vegaprotocol/types';

export const MARKETS_QUERY = gql`
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
  proposalVoteDeadline: string;
  proposalEnactmentDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalMarketId: string;
  proposalTerms: string;
  proposalReference: string;
}

const DOCS_LINK = '/update-market-proposal';

export const ProposeUpdateMarket = () => {
  const {
    params,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_updateMarket_maxClose,
    NetworkParams.governance_proposal_updateMarket_minClose,
    NetworkParams.governance_proposal_updateMarket_maxEnact,
    NetworkParams.governance_proposal_updateMarket_minEnact,
    NetworkParams.governance_proposal_updateMarket_minProposerBalance,
    NetworkParams.spam_protection_proposal_min_tokens,
  ]);

  const {
    data: marketsData,
    loading: marketsLoading,
    error: marketsError,
  } = useQuery<ProposalMarketsQuery>(MARKETS_QUERY);
  const sortedMarkets = useMemo(() => {
    if (!marketsData?.marketsConnection?.edges.length) {
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

  const [selectedMarket, setSelectedMarket] = useState<string | undefined>(
    undefined
  );

  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
  } = useForm<UpdateMarketProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const onSubmit = async (fields: UpdateMarketProposalFormFields) => {
    const isVoteDeadlineAtMinimum =
      fields.proposalVoteDeadline ===
      deadlineToRoundedHours(
        params.governance_proposal_updateMarket_minClose
      ).toString();

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
        closingTimestamp: getClosingTimestamp(
          fields.proposalVoteDeadline,
          isVoteDeadlineAtMinimum
        ),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline,
          isVoteDeadlineAtMinimum
        ),
      },
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading && marketsLoading}
      error={networkParamsError && marketsError}
      data={params && marketsData}
    >
      <Heading title={t('UpdateMarketProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalMinRequirements
              minProposalBalance={
                params.governance_proposal_updateMarket_minProposerBalance
              }
              spamProtectionMin={params.spam_protection_proposal_min_tokens}
              userAction={ProposalUserAction.CREATE}
            />

            {VEGA_DOCS_URL && (
              <p className="text-sm" data-testid="proposal-docs-link">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <Link
                  href={`${VEGA_DOCS_URL}/tutorials/proposals${DOCS_LINK}`}
                  target="_blank"
                >{`${VEGA_DOCS_URL}/tutorials/proposals${DOCS_LINK}`}</Link>
              </p>
            )}

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreMarketsInfo')}{' '}
                <Link
                  href={`${VEGA_EXPLORER_URL}/markets`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/markets`}</Link>
              </p>
            )}

            <div data-testid="update-market-proposal-form">
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

                <ProposalFormSubheader>
                  {t('SelectAMarketToChange')}
                </ProposalFormSubheader>

                <FormGroup
                  label={t('SelectAMarketToChange')}
                  labelFor="proposal-market"
                  hideLabel={true}
                >
                  <Select
                    data-testid="proposal-market-select"
                    id="proposal-market"
                    {...register('proposalMarketId', {
                      required: t('Required'),
                    })}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                  >
                    <option value="">{t('SelectMarket')}</option>
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
                    validate: (value) => validateJson(value),
                  })}
                  labelOverride={t('ProposeUpdateMarketTerms')}
                  errorMessage={errors?.proposalTerms?.message}
                  customDocLink={DOCS_LINK}
                />

                <ProposalFormVoteAndEnactmentDeadline
                  onVoteMinMax={setValue}
                  voteRegister={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  voteErrorMessage={errors?.proposalVoteDeadline?.message}
                  voteMinClose={
                    params.governance_proposal_updateMarket_minClose
                  }
                  voteMaxClose={
                    params.governance_proposal_updateMarket_maxClose
                  }
                  onEnactMinMax={setValue}
                  enactmentRegister={register('proposalEnactmentDeadline', {
                    required: t('Required'),
                  })}
                  enactmentErrorMessage={
                    errors?.proposalEnactmentDeadline?.message
                  }
                  enactmentMinClose={
                    params.governance_proposal_updateMarket_minEnact
                  }
                  enactmentMaxClose={
                    params.governance_proposal_updateMarket_maxEnact
                  }
                />

                <ProposalFormSubmit isSubmitting={isSubmitting} />
                <ProposalFormTransactionDialog
                  finalizedProposal={finalizedProposal}
                  TransactionDialog={Dialog}
                />
              </form>
            </div>
          </>
        )}
      </VegaWalletContainer>
    </AsyncRenderer>
  );
};
