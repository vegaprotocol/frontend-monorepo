import { useTranslation } from 'react-i18next';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { ProposalsConnection_proposalsConnection_edges_node as ProposalNode } from '@vegaprotocol/governance';

export const ProposalHeader = ({ proposal }: { proposal: ProposalNode }) => {
  const { t } = useTranslation();
  const { change } = proposal.terms;

  let detailsTwo: ReactNode;

  const headerMaxLength = 100;
  const descriptionOneMaxLength = 60;
  let header = proposal.rationale.title.trim();
  let description = proposal.rationale.description.trim();
  if (header.length === 0 && description.length > 0) {
    header = description;
    description = '';
  }
  const headerOverflow = header.length > headerMaxLength;
  const descriptionOneOverflow =
    description.length > headerMaxLength + descriptionOneMaxLength;

  const headerText = `${header
    .trim()
    .substring(0, headerMaxLength - 1)
    .trim()}${headerOverflow ? '…' : ''}`;
  const detailsOne = `${description
    .trim()
    .substring(0, descriptionOneMaxLength - 1)
    .trim()}${descriptionOneOverflow ? '…' : ''}`;

  switch (change.__typename) {
    case 'NewMarket': {
      detailsTwo = (
        <>
          {t('Code')}: {change.instrument.code}.{' '}
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
      detailsTwo = `${t('Market change')}: ${change.marketId}`;
      break;
    }
    case 'NewAsset': {
      detailsTwo = (
        <>
          {t('Symbol')}: {change.symbol}.{' '}
          <Lozenge>
            {change.source.__typename === 'ERC20'
              ? `ERC20 ${change.source.contractAddress}`
              : `${t('Max faucet amount mint')}: ${
                  change.source.maxFaucetAmountMint
                }`}
          </Lozenge>
        </>
      );
      break;
    }
    case 'UpdateNetworkParameter': {
      const parametersClasses = 'font-mono leading-none';
      detailsTwo = (
        <>
          <span className={`${parametersClasses} mr-2`}>
            {change.networkParameter.key}
          </span>{' '}
          {t('to')}{' '}
          <span className={`${parametersClasses} ml-2`}>
            {change.networkParameter.value}
          </span>
        </>
      );
      break;
    }
    case 'NewFreeform': {
      detailsTwo = `${proposal.id}`;

      break;
    }
  }

  return (
    <div className="text-sm mb-2">
      <header data-testid="proposal-header">
        <h2 className="text-lg mx-0 mt-0 mb-1 font-semibold">
          {headerText || t('Unknown proposal')}
        </h2>
      </header>
      {detailsOne && <div data-testid="proposal-details-one">{detailsOne}</div>}
      {detailsTwo && <div data-testid="proposal-details-two">{detailsTwo}</div>}
    </div>
  );
};
