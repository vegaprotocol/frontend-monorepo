import { useTranslation } from 'react-i18next';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { Proposals_proposals } from '../../routes/governance/proposals/__generated__/Proposals';

export const ProposalDescription = ({
  proposal,
}: {
  proposal: Proposals_proposals;
}) => {
  const { t } = useTranslation();
  const { change } = proposal.terms;

  let headerText: string;
  let descriptionOne: ReactNode;
  let descriptionTwo: ReactNode;

  switch (change.__typename) {
    case 'NewMarket': {
      headerText = `${t('New market')}: ${change.instrument.name}`;
      descriptionOne = (
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
      descriptionOne = (
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
      headerText = `${t('Network parameter')}`;
      descriptionOne = (
        <>
          <Lozenge>{change.networkParameter.key}</Lozenge> {t('to')}{' '}
          <Lozenge>{change.networkParameter.value}</Lozenge>
        </>
      );
      break;
    }
    case 'NewFreeform': {
      const description = proposal.rationale.description.trim();
      const headerMaxLength = 100;
      const descriptionOneMaxLength = 60;
      const headerOverflow = description.length > headerMaxLength;
      const descriptionOneOverflow =
        description.length > headerMaxLength + descriptionOneMaxLength;

      headerText = `${description.substring(0, headerMaxLength - 1).trim()}${
        headerOverflow ? '…' : ''
      }`;
      descriptionOne = headerOverflow
        ? `${description
            .substring(
              headerMaxLength - 1,
              headerMaxLength + descriptionOneMaxLength - 1
            )
            .trim()}${descriptionOneOverflow ? '…' : ''}`
        : '';
      descriptionTwo = `${proposal.id}`;
      break;
    }
    default: {
      headerText = `${t('Unknown proposal')}`;
    }
  }

  return (
    <>
      <header data-testid="proposal-header">{headerText}</header>
      <div data-testid="proposal-details-one">{descriptionOne}</div>
      <div data-testid="proposal-details-two">{descriptionTwo}</div>
    </>
  );
};
