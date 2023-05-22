import { useTranslation } from 'react-i18next';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import type { ReactNode } from 'react';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { truncateMiddle } from '../../../../lib/truncate-middle';
import { CurrentProposalState } from '../current-proposal-state';
import { ProposalInfoLabel } from '../proposal-info-label';

export const ProposalHeader = ({
  proposal,
  isListItem = true,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  isListItem?: boolean;
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
      proposalType = 'NewMarket';
      fallbackTitle = t('NewMarketProposal');
      details = (
        <>
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
    case 'UpdateMarket': {
      proposalType = 'UpdateMarket';
      fallbackTitle = t('UpdateMarketProposal');
      details = (
        <>
          <span>{t('Market change')}:</span>{' '}
          <span>{truncateMiddle(change.marketId)}</span>
        </>
      );
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
      <div data-testid="proposal-title">
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

      <div className="flex items-center gap-2 mb-4">
        <div data-testid="proposal-type">
          <ProposalInfoLabel variant="secondary">
            {t(`${proposalType}`)}
          </ProposalInfoLabel>
        </div>

        <div data-testid="proposal-status">
          <CurrentProposalState proposal={proposal} />
        </div>
      </div>

      {details && (
        <div data-testid="proposal-details" className="break-words my-10">
          {details}
        </div>
      )}
    </>
  );
};
