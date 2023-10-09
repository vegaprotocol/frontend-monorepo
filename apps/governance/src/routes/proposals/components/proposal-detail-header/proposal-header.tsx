import { useTranslation } from 'react-i18next';
import { Lozenge, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import type { ReactNode } from 'react';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { truncateMiddle } from '../../../../lib/truncate-middle';
import { CurrentProposalState } from '../current-proposal-state';
import { ProposalInfoLabel } from '../proposal-info-label';
import { useSuccessorMarketProposalDetails } from '@vegaprotocol/proposals';
import { FLAGS } from '@vegaprotocol/environment';
import Routes from '../../../routes';
import { Link } from 'react-router-dom';
import type { VoteState } from '../vote-details/use-user-vote';
import { VoteBreakdown } from '../vote-breakdown';

export const ProposalHeader = ({
  proposal,
  isListItem = true,
  voteState,
}: {
  proposal: ProposalQuery['proposal'];
  isListItem?: boolean;
  voteState?: VoteState | null;
}) => {
  const { t } = useTranslation();
  const change = proposal?.terms.change;

  let details: ReactNode;
  let proposalType = '';
  let fallbackTitle = '';

  const title = proposal?.rationale.title.trim();

  const titleContent = shorten(title ?? '', 100);

  switch (change?.__typename) {
    case 'NewMarket': {
      proposalType =
        FLAGS.PRODUCT_PERPETUALS && change?.instrument?.product?.__typename
          ? `NewMarket${change?.instrument?.product?.__typename}`
          : 'NewMarket';
      fallbackTitle = t('NewMarketProposal');
      details = (
        <>
          {FLAGS.SUCCESSOR_MARKETS && (
            <SuccessorCode proposalId={proposal?.id} />
          )}
          <span>
            {t('Code')}: {change.instrument.code}.
          </span>{' '}
          {change.instrument.futureProduct?.settlementAsset.symbol ? (
            <>
              <span className="font-semibold">
                {change.instrument.futureProduct.settlementAsset.symbol}
              </span>{' '}
              {t('settled future')}.
            </>
          ) : (
            ''
          )}
        </>
      );
      break;
    }
    case 'UpdateMarketState': {
      proposalType =
        FLAGS.UPDATE_MARKET_STATE && change?.updateType
          ? t(change.updateType)
          : 'UpdateMarketState';
      fallbackTitle = t('UpdateMarketStateProposal');
      details = (
        <span>
          {FLAGS.UPDATE_MARKET_STATE &&
          change?.market?.id &&
          change.updateType ? (
            <>
              {t(change.updateType)}: {truncateMiddle(change.market.id)}
            </>
          ) : null}
        </span>
      );
      break;
    }
    case 'UpdateMarket': {
      proposalType = 'UpdateMarket';
      fallbackTitle = t('UpdateMarketProposal');
      details = (
        <>
          <span>{t('MarketChange')}:</span>{' '}
          <span>{truncateMiddle(change.marketId)}</span>
        </>
      );
      break;
    }
    case 'UpdateReferralProgram': {
      proposalType = 'UpdateReferralProgram';
      fallbackTitle = t('UpdateReferralProgramProposal');
      break;
    }
    case 'NewAsset': {
      proposalType = 'NewAsset';
      fallbackTitle = t('NewAssetProposal');
      details = (
        <>
          <span>{t('Symbol')}:</span> <Lozenge>{change.symbol}.</Lozenge>{' '}
          {change.source.__typename === 'ERC20' && (
            <>
              <span>{t('ERC20ContractAddress')}:</span>{' '}
              <Lozenge>{change.source.contractAddress}</Lozenge>
            </>
          )}{' '}
          {change.source.__typename === 'BuiltinAsset' && (
            <>
              <span>{t('MaxFaucetAmountMint')}:</span>{' '}
              <Lozenge>{change.source.maxFaucetAmountMint}</Lozenge>
            </>
          )}
        </>
      );
      break;
    }
    case 'UpdateNetworkParameter': {
      proposalType = 'NetworkParameter';
      fallbackTitle = t('NetworkParameterProposal');
      details = (
        <>
          <span>{t('Change')}:</span>{' '}
          <Lozenge>{change.networkParameter.key}</Lozenge>{' '}
          <span>{t('to')}</span>{' '}
          <span className="whitespace-nowrap">
            <Lozenge>{change.networkParameter.value}</Lozenge>
          </span>
        </>
      );
      break;
    }
    case 'NewFreeform': {
      proposalType = 'Freeform';
      fallbackTitle = t('FreeformProposal');
      details = <span />;
      break;
    }
    case 'UpdateAsset': {
      proposalType = 'UpdateAsset';
      fallbackTitle = t('UpdateAssetProposal');
      details = (
        <>
          <span>{t('AssetID')}:</span>{' '}
          <Lozenge>{truncateMiddle(change.assetId)}</Lozenge>
        </>
      );
      break;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 text-sm">
        <div data-testid="proposal-type">
          <ProposalInfoLabel variant="secondary">
            {t(`${proposalType}`)}
          </ProposalInfoLabel>
        </div>

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

      {details && (
        <div
          data-testid="proposal-details"
          className="break-words mb-6 text-vega-light-200"
        >
          {details}
        </div>
      )}

      <VoteBreakdown proposal={proposal} />
    </>
  );
};

const SuccessorCode = ({ proposalId }: { proposalId?: string | null }) => {
  const { t } = useTranslation();
  const successor = useSuccessorMarketProposalDetails(proposalId);

  return successor.parentMarketId || successor.code ? (
    <span className="block" data-testid="proposal-successor-info">
      {t('Successor market to')}:{' '}
      <Link
        to={`${Routes.PROPOSALS}/${successor.parentMarketId}`}
        className="hover:underline"
      >
        {successor.code || successor.parentMarketId}
      </Link>
    </span>
  ) : null;
};
