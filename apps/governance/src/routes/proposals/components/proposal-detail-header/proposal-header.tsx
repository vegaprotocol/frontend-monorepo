import { useTranslation } from 'react-i18next';
import {
  CopyWithTooltip,
  Lozenge,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import { truncateMiddle } from '../../../../lib/truncate-middle';
import { CurrentProposalState } from '../current-proposal-state';
import { ProposalInfoLabel } from '../proposal-info-label';
import {
  useCancelTransferProposalDetails,
  useInstrumentDetailsQuery,
  useNewTransferProposalDetails,
} from '@vegaprotocol/proposals';
import {
  CONSOLE_MARKET_PAGE,
  DApp,
  useFeatureFlags,
  useLinks,
} from '@vegaprotocol/environment';
import Routes from '../../../routes';
import { Link } from 'react-router-dom';
import { type VoteState } from '../vote-details/use-user-vote';
import { VoteBreakdown } from '../vote-breakdown';
import { GovernanceTransferKindMapping } from '@vegaprotocol/types';
import { type Proposal, type BatchProposal } from '../../types';
import { type ProposalTermsFieldsFragment } from '../../__generated__/Proposals';

const ProposalTypeTags = ({
  proposal,
}: {
  proposal: Proposal | BatchProposal;
}) => {
  if (proposal.__typename === 'Proposal') {
    return (
      <div data-testid="proposal-type">
        <ProposalTypeTag terms={proposal.terms} />
      </div>
    );
  }

  if (proposal.__typename === 'BatchProposal') {
    return (
      <div data-testid="proposal-type" className="flex gap-1">
        {proposal.subProposals?.map((subProposal, i) => {
          if (!subProposal?.terms) return null;
          return <ProposalTypeTag key={i} terms={subProposal.terms} />;
        })}
      </div>
    );
  }

  return null;
};

const ProposalTypeTag = ({ terms }: { terms: ProposalTermsFieldsFragment }) => {
  const { t } = useTranslation();

  switch (terms.change.__typename) {
    // Speical case for markets where we want to show the product type in the tag
    case 'NewMarket': {
      return (
        <ProposalInfoLabel variant="secondary">
          {t(
            terms.change?.instrument?.product?.__typename
              ? `NewMarket${terms.change.instrument.product.__typename}`
              : 'NewMarket'
          )}
        </ProposalInfoLabel>
      );
    }
    default: {
      return (
        <ProposalInfoLabel variant="secondary">
          {t(terms.change.__typename)}
        </ProposalInfoLabel>
      );
    }
  }
};

const ProposalDetails = ({
  proposal,
}: {
  proposal: Proposal | BatchProposal;
}) => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags((store) => store.flags);
  const consoleLink = useLinks(DApp.Console);

  const renderDetails = (terms: ProposalTermsFieldsFragment) => {
    switch (terms.change?.__typename) {
      case 'NewMarket': {
        const getAsset = (terms: ProposalTermsFieldsFragment) => {
          if (
            terms?.change.__typename === 'NewMarket' &&
            (terms.change.instrument.product?.__typename === 'FutureProduct' ||
              terms.change.instrument.product?.__typename ===
                'PerpetualProduct')
          ) {
            return terms.change.instrument.product.settlementAsset;
          }
          return undefined;
        };

        return (
          <>
            {terms.change.successorConfiguration && (
              <ParentMarketCode
                parentMarketId={
                  terms.change.successorConfiguration.parentMarketId
                }
              />
            )}
            <span>
              {t('Code')}: {terms.change.instrument.code}.
            </span>{' '}
            {terms && getAsset(terms)?.symbol ? (
              <>
                <span className="font-semibold">{getAsset(terms)?.symbol}</span>{' '}
                {t('settled future')}.
              </>
            ) : (
              ''
            )}
          </>
        );
      }
      case 'UpdateMarketState': {
        // fallbackTitle = t('UpdateMarketStateProposal');
        return (
          <span>
            {featureFlags.UPDATE_MARKET_STATE &&
            terms.change?.market?.id &&
            terms.change.updateType ? (
              <>
                {t(terms.change.updateType)}:{' '}
                {truncateMiddle(terms.change.market.id)}
              </>
            ) : null}
          </span>
        );
      }
      case 'UpdateMarket': {
        // fallbackTitle = t('UpdateMarketProposal');
        return (
          <>
            <span>{t('UpdateToMarket')}:</span>{' '}
            <span className="inline-flex items-start gap-2">
              <span className="break-all">{terms.change.marketId} </span>
              <span className="inline-flex items-end gap-0">
                <CopyWithTooltip
                  text={terms.change.marketId}
                  description={t('copyToClipboard')}
                >
                  <button className="inline-block px-1">
                    <VegaIcon size={20} name={VegaIconNames.COPY} />
                  </button>
                </CopyWithTooltip>
                <Tooltip description={t('OpenInConsole')} align="center">
                  <button
                    className="inline-block px-1"
                    onClick={() => {
                      const marketPageLink = consoleLink(
                        CONSOLE_MARKET_PAGE.replace(
                          ':marketId',
                          // @ts-ignore ts doesn't like this field even though its already a string above???
                          terms.change.marketId
                        )
                      );
                      window.open(marketPageLink, '_blank');
                    }}
                  >
                    <VegaIcon size={20} name={VegaIconNames.OPEN_EXTERNAL} />
                  </button>
                </Tooltip>
              </span>
            </span>
          </>
        );
      }
      case 'UpdateReferralProgram': {
        // fallbackTitle = t('UpdateReferralProgramProposal');
        return null;
      }
      case 'UpdateVolumeDiscountProgram': {
        // fallbackTitle = t('UpdateVolumeDiscountProgramProposal');
        return null;
      }
      case 'NewAsset': {
        // fallbackTitle = t('NewAssetProposal');
        return (
          <>
            <span>{t('Symbol')}:</span>{' '}
            <Lozenge>{terms.change.symbol}.</Lozenge>{' '}
            {terms.change.source.__typename === 'ERC20' && (
              <>
                <span>{t('ERC20ContractAddress')}:</span>{' '}
                <Lozenge>{terms.change.source.contractAddress}</Lozenge>
              </>
            )}{' '}
            {terms.change.source.__typename === 'BuiltinAsset' && (
              <>
                <span>{t('MaxFaucetAmountMint')}:</span>{' '}
                <Lozenge>{terms.change.source.maxFaucetAmountMint}</Lozenge>
              </>
            )}
          </>
        );
      }
      case 'UpdateNetworkParameter': {
        // fallbackTitle = t('NetworkParameterProposal');
        return (
          <>
            <span>{t('Change')}:</span>{' '}
            <Lozenge>{terms.change.networkParameter.key}</Lozenge>{' '}
            <span>{t('to')}</span>{' '}
            <span className="whitespace-nowrap">
              <Lozenge>{terms.change.networkParameter.value}</Lozenge>
            </span>
          </>
        );
      }
      case 'NewFreeform': {
        // fallbackTitle = t('FreeformProposal');
        return <span />;
      }
      case 'UpdateAsset': {
        // fallbackTitle = t('UpdateAssetProposal');
        return (
          <>
            <span>{t('AssetID')}:</span>{' '}
            <Lozenge>{truncateMiddle(terms.change.assetId)}</Lozenge>
          </>
        );
      }
      case 'NewTransfer':
        // fallbackTitle = t('NewTransferProposal');
        return featureFlags.GOVERNANCE_TRANSFERS ? (
          <NewTransferSummary proposalId={proposal?.id} />
        ) : null;
      case 'CancelTransfer':
        // fallbackTitle = t('CancelTransferProposal');
        return featureFlags.GOVERNANCE_TRANSFERS ? (
          <CancelTransferSummary proposalId={proposal?.id} />
        ) : null;
      default: {
        return null;
      }
    }
  };

  let details = null;

  if (proposal.__typename === 'Proposal') {
    details = renderDetails(proposal.terms);
  }

  if (proposal.__typename === 'BatchProposal' && proposal.subProposals) {
    details = (
      <ul className="flex flex-col gap-2">
        {proposal.subProposals.map((p, i) => {
          if (!p?.terms) return null;
          return <li key={i}>{renderDetails(p.terms)}</li>;
        })}
      </ul>
    );
  }

  return (
    <div
      data-testid="proposal-details"
      className="break-words mb-6 text-vega-light-200"
    >
      {details}
    </div>
  );
};

export const ProposalHeader = ({
  proposal,
  isListItem = true,
  voteState,
}: {
  proposal: Proposal | BatchProposal;
  isListItem?: boolean;
  voteState?: VoteState | null;
}) => {
  const { t } = useTranslation();

  const title = proposal?.rationale.title.trim();
  const fallbackTitle = t(
    proposal.__typename === 'Proposal'
      ? proposal.terms.change.__typename
      : 'Batch proposal'
  );
  const titleContent = shorten(title ?? '', 100);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 text-sm">
        <ProposalTypeTags proposal={proposal} />

        <div className="flex items-center gap-6">
          {(voteState === 'Yes' || voteState === 'No') && (
            <div
              className="flex items-center gap-2"
              data-testid={`user-voted-${voteState.toLowerCase()}`}
            >
              <div data-testid="you-voted-icon">
                <VegaIcon name={VegaIconNames.VOTE} size={24} />
              </div>
              <div>
                {t('voted')}{' '}
                <span className="uppercase">{t(`voteState_${voteState}`)}</span>
              </div>
            </div>
          )}

          <div data-testid="proposal-status">
            <CurrentProposalState proposal={proposal} />
          </div>
        </div>
      </div>

      <div data-testid="proposal-title" className="break-all">
        {isListItem ? (
          <header>
            <SubHeading
              title={titleContent || fallbackTitle || t('Unknown proposal')}
            />
          </header>
        ) : (
          <Heading
            title={titleContent || fallbackTitle || t('Unknown proposal')}
          />
        )}
      </div>
      <ProposalDetails proposal={proposal} />
      <VoteBreakdown proposal={proposal} />
    </>
  );
};

export const ParentMarketCode = ({
  parentMarketId,
}: {
  parentMarketId: string;
}) => {
  const { t } = useTranslation();
  const { data } = useInstrumentDetailsQuery({
    variables: {
      marketId: parentMarketId,
    },
  });

  if (!data?.market?.tradableInstrument.instrument.code) return null;

  return (
    <span className="block" data-testid="proposal-successor-info">
      {t('Successor market to')}:{' '}
      <Link
        to={`${Routes.PROPOSALS}/${parentMarketId}`}
        className="hover:underline"
      >
        {data.market.tradableInstrument.instrument.code}
      </Link>
    </span>
  );
};

export const NewTransferSummary = ({
  proposalId,
}: {
  proposalId?: string | null;
}) => {
  const { t } = useTranslation();
  const details = useNewTransferProposalDetails(proposalId);

  if (!details) return null;

  return (
    <span>
      {GovernanceTransferKindMapping[details.kind.__typename]}{' '}
      {t('transfer from')}{' '}
      <Lozenge>
        {details.source
          ? truncateMiddle(details.source)
          : t(details.sourceType)}
      </Lozenge>{' '}
      {t('to')}{' '}
      <Lozenge>
        {details.destination
          ? truncateMiddle(details.destination)
          : t(details.destinationType)}
      </Lozenge>
    </span>
  );
};

export const CancelTransferSummary = ({
  proposalId,
}: {
  proposalId?: string | null;
}) => {
  const { t } = useTranslation();
  const details = useCancelTransferProposalDetails(proposalId);

  if (!details) return null;

  return (
    <span>
      {t('Cancel transfer: ')}{' '}
      <Lozenge>{truncateMiddle(details.transferId)}</Lozenge>
    </span>
  );
};
