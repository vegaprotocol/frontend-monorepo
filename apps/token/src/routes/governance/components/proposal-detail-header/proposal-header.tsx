import { useTranslation } from 'react-i18next';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

export const ProposalHeader = ({
  proposal,
}: {
  proposal: Proposals_proposals;
}) => {
  const { t } = useTranslation();
  const { change } = proposal.terms;

  let headerText: string;
  let detailsOne: ReactNode;
  let detailsTwo: ReactNode;

  switch (change.__typename) {
    case 'NewMarket': {
      headerText = `${t('New market')}: ${change.instrument.name}`;
      detailsOne = (
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
      headerText = `${t('Market change')}: ${change.marketId}`;
      break;
    }
    case 'NewAsset': {
      headerText = `${t('New asset')}: ${change.name}`;
      detailsOne = (
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
      headerText = `${t('Network parameter')}`;
      detailsOne = (
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
      // When rationale exists (https://github.com/vegaprotocol/frontend-monorepo/issues/824):
      // const description = proposal.rationale.description.trim();
      // const headerMaxLength = 100;
      // const descriptionOneMaxLength = 60;
      // const headerOverflow = description.length > headerMaxLength;
      // const descriptionOneOverflow =
      //   description.length > headerMaxLength + descriptionOneMaxLength;
      //
      // headerText = `${description.substring(0, headerMaxLength - 1).trim()}${
      //   headerOverflow ? '…' : ''
      // }`;
      // detailsOne = headerOverflow
      //   ? `${description
      //       .substring(
      //         headerMaxLength - 1,
      //         headerMaxLength + descriptionOneMaxLength - 1
      //       )
      //       .trim()}${descriptionOneOverflow ? '…' : ''}`
      //   : '';
      // detailsTwo = `${proposal.id}`;
      headerText = proposal.id
        ? `${t('Freeform proposal')}: ${proposal.id.trim()}`
        : `${t('Unknown proposal')}`;

      break;
    }
    default: {
      headerText = `${t('Unknown proposal')}`;
    }
  }

  return (
    <div className="text-sm mb-2">
      <header data-testid="proposal-header">
        <h2 className="text-lg mx-0 mt-0 mb-1 font-semibold">{headerText}</h2>
      </header>
      {detailsOne && <div data-testid="proposal-details-one">{detailsOne}</div>}
      {detailsTwo && <div data-testid="proposal-details-two">{detailsTwo}</div>}
    </div>
  );
};
