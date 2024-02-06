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
import {
  GovernanceTransferKindMapping,
  type ProposalRejectionReason,
  ProposalRejectionReasonMapping,
  ProposalState,
} from '@vegaprotocol/types';
import { type Proposal, type BatchProposal } from '../../types';
import { type ProposalTermsFieldsFragment } from '../../__generated__/Proposals';
import { differenceInHours, format, formatDistanceToNowStrict } from 'date-fns';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';

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
        return null;
      }
      case 'UpdateVolumeDiscountProgram': {
        return null;
      }
      case 'NewAsset': {
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
        return <span />;
      }
      case 'UpdateAsset': {
        return (
          <>
            <span>{t('AssetID')}:</span>{' '}
            <Lozenge>{truncateMiddle(terms.change.assetId)}</Lozenge>
          </>
        );
      }
      case 'NewTransfer':
        return featureFlags.GOVERNANCE_TRANSFERS ? (
          <NewTransferSummary proposalId={proposal?.id} />
        ) : null;
      case 'CancelTransfer':
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
    details = (
      <div>
        <div>{renderDetails(proposal.terms)}</div>
        <VoteStateText
          state={proposal.state}
          closingDatetime={proposal.terms.closingDatetime}
          enactmentDatetime={proposal.terms.enactmentDatetime}
          rejectionReason={proposal.rejectionReason}
        />
      </div>
    );
  }

  if (proposal.__typename === 'BatchProposal' && proposal.subProposals) {
    details = (
      <div>
        <h3 className="text-xl border-b border-default pb-3 mb-3">
          Proposals in batch
        </h3>
        <ul className="flex flex-col gap-2 border-b border-default pb-3 mb-3">
          {proposal.subProposals.map((p, i) => {
            if (!p?.terms) return null;
            return (
              <li key={i}>
                <div>{renderDetails(p.terms)}</div>
                <SubProposalStateText
                  state={proposal.state}
                  enactmentDatetime={p.terms.enactmentDatetime}
                />
              </li>
            );
          })}
        </ul>
        <BatchProposalStateText
          state={proposal.state}
          closingDatetime={proposal.batchTerms?.closingDatetime}
          rejectionReason={proposal.rejectionReason}
        />
      </div>
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

const VoteStateText = ({
  state,
  closingDatetime,
  enactmentDatetime,
  rejectionReason,
}: {
  state: ProposalState;
  closingDatetime: string;
  enactmentDatetime: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();
  const nowToCloseInHours = differenceInHours(
    new Date(closingDatetime),
    new Date()
  );

  const props = {
    'data-testid': 'vote-details',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      return (
        <p {...props}>
          {t('enactedOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      return (
        <p {...props}>
          {t('enactsOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_OPEN: {
      return (
        <p {...props}>
          <span className={nowToCloseInHours < 6 ? 'text-vega-orange' : ''}>
            {t('{{time}} left to vote', {
              time: formatDistanceToNowStrict(new Date(closingDatetime)),
            })}
          </span>
        </p>
      );
    }
    case ProposalState.STATE_DECLINED: {
      return <p {...props}>{t(state)}</p>;
    }
    case ProposalState.STATE_REJECTED: {
      const props = { 'data-testid': 'vote-status' };

      if (rejectionReason) {
        return (
          <p {...props}>{t(ProposalRejectionReasonMapping[rejectionReason])}</p>
        );
      }

      return <p {...props}>{t('Proposal rejected')}</p>;
    }
    default: {
      return null;
    }
  }
};

/**
 * Renders state details relevant to the sub proposal, namely the enactment
 * date and time
 */
const SubProposalStateText = ({
  state,
  enactmentDatetime,
}: {
  state: ProposalState;
  enactmentDatetime: string;
}) => {
  const { t } = useTranslation();

  const props = {
    'data-testid': 'vote-details',
    className: 'm-0',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      return (
        <p {...props}>
          {t('enactedOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_OPEN:
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      return (
        <p {...props}>
          {t('enactsOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_REJECTED:
    case ProposalState.STATE_DECLINED: {
      // If voting is still open we render a single clost time for all sub proposals
      return null;
    }
    default: {
      return null;
    }
  }
};

/**
 * Renders state details relevant for the entire batch. IE. if the proposal was
 * rejected or declined, or the vote close time. Does not render enactment times as
 * those are relevant to the sub proposal
 */
const BatchProposalStateText = ({
  state,
  closingDatetime,
  rejectionReason,
}: {
  state: ProposalState;
  closingDatetime: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();
  const nowToCloseInHours = differenceInHours(
    new Date(closingDatetime),
    new Date()
  );

  const props = {
    'data-testid': 'vote-details',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED:
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      return null;
    }
    case ProposalState.STATE_OPEN: {
      return (
        <p {...props}>
          <span className={nowToCloseInHours < 6 ? 'text-vega-orange' : ''}>
            {t('{{time}} left to vote', {
              time: formatDistanceToNowStrict(new Date(closingDatetime)),
            })}
          </span>
        </p>
      );
    }
    case ProposalState.STATE_DECLINED: {
      return <p {...props}>{t(state)}</p>;
    }
    case ProposalState.STATE_REJECTED: {
      const props = { 'data-testid': 'vote-status' };

      if (rejectionReason) {
        return (
          <p {...props}>{t(ProposalRejectionReasonMapping[rejectionReason])}</p>
        );
      }

      return <p {...props}>{t('Proposal rejected')}</p>;
    }
    default: {
      return null;
    }
  }
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
      ? 'Unknown proposal'
      : 'Unknown batch proposal'
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
            <SubHeading title={titleContent || fallbackTitle} />
          </header>
        ) : (
          <Heading title={titleContent || fallbackTitle} />
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
