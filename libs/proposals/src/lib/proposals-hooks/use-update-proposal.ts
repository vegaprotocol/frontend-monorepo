import * as Schema from '@vegaprotocol/types';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useMemo } from 'react';
import first from 'lodash/first';
import { proposalsDataProvider } from '../proposals-data-provider';
import type { ProposalListFieldsFragment } from '../proposals-data-provider';

type UseUpdateProposalProps = {
  id?: string;
  proposalType:
    | Schema.ProposalType.TYPE_UPDATE_ASSET
    | Schema.ProposalType.TYPE_UPDATE_MARKET;
};

type UseUpdateProposal = {
  data: ProposalListFieldsFragment | undefined;
  loading: boolean;
  error: Error | undefined;
};

const changeCondition = {
  [Schema.ProposalType.TYPE_UPDATE_ASSET]: (
    id: string,
    change: ProposalListFieldsFragment['terms']['change']
  ) => change.__typename === 'UpdateAsset' && change.assetId === id,
  [Schema.ProposalType.TYPE_UPDATE_MARKET]: (
    id: string,
    change: ProposalListFieldsFragment['terms']['change']
  ) => change.__typename === 'UpdateMarket' && change.marketId === id,
};

export const useUpdateProposal = ({
  id,
  proposalType,
}: UseUpdateProposalProps): UseUpdateProposal => {
  const variables = useMemo(
    () => ({
      proposalType,
      skipUpdates: true,
    }),
    [proposalType]
  );

  const { data, loading, error } = useDataProvider({
    dataProvider: proposalsDataProvider,
    variables,
  });

  const proposal = id
    ? first(
        (data || []).filter(
          (proposal) =>
            [
              Schema.ProposalState.STATE_OPEN,
              Schema.ProposalState.STATE_PASSED,
              Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
            ].includes(proposal.state) &&
            changeCondition[proposalType](id, proposal.terms.change)
        )
      )
    : undefined;

  return { data: proposal, loading, error };
};

export enum UpdateMarketFields {
  Code,
  QuoteName,
  PriceMonitoring,
  LiquidityMonitoring,
  RiskParameters,
}

export enum UpdateAssetFields {
  Quantum,
  LifetimeLimit,
  WithdrawThreshold,
}

export type UpdateProposalField = UpdateAssetFields | UpdateMarketFields;

const fieldGetters = {
  [UpdateMarketFields.Code]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateMarket') {
      const proposed =
        change.updateMarketConfiguration.__typename !== undefined &&
        change.updateMarketConfiguration.instrument.__typename !== undefined;
      return (
        proposed && change.updateMarketConfiguration.instrument.code.length > 0
      );
    }
    return false;
  },
  [UpdateMarketFields.QuoteName]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateMarket') {
      const proposed =
        change.updateMarketConfiguration.__typename !== undefined &&
        change.updateMarketConfiguration.instrument.__typename !== undefined &&
        change.updateMarketConfiguration.instrument.product.__typename !==
          undefined;
      return (
        proposed &&
        'quoteName' in change.updateMarketConfiguration.instrument.product &&
        change.updateMarketConfiguration.instrument.product.quoteName.length > 0
      );
    }
    return false;
  },
  [UpdateMarketFields.PriceMonitoring]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateMarket') {
      const proposed =
        change.updateMarketConfiguration.__typename !== undefined &&
        change.updateMarketConfiguration.priceMonitoringParameters
          .__typename !== undefined &&
        change.updateMarketConfiguration.priceMonitoringParameters.triggers
          ?.length;
      return proposed;
    }
    return false;
  },
  [UpdateMarketFields.LiquidityMonitoring]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateMarket') {
      const proposed =
        change.updateMarketConfiguration.__typename !== undefined &&
        change.updateMarketConfiguration.liquidityMonitoringParameters
          .__typename !== undefined;
      return proposed;
    }
    return false;
  },
  [UpdateMarketFields.RiskParameters]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateMarket') {
      const proposed =
        change.updateMarketConfiguration.__typename !== undefined &&
        change.updateMarketConfiguration.riskParameters.__typename !==
          undefined;
      const log =
        change.updateMarketConfiguration.riskParameters.__typename ===
          'UpdateMarketLogNormalRiskModel' &&
        change.updateMarketConfiguration.riskParameters.logNormal !== undefined;
      const simple =
        change.updateMarketConfiguration.riskParameters.__typename ===
          'UpdateMarketSimpleRiskModel' &&
        change.updateMarketConfiguration.riskParameters.simple !== undefined;
      return proposed && (log || simple);
    }
    return false;
  },
  [UpdateAssetFields.Quantum]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateAsset') {
      const proposed = change.quantum.length > 0;
      return proposed;
    }
    return false;
  },
  [UpdateAssetFields.LifetimeLimit]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateAsset') {
      const proposed =
        change.source.__typename === 'UpdateERC20' &&
        change.source.lifetimeLimit.length > 0;
      return proposed;
    }
    return false;
  },
  [UpdateAssetFields.WithdrawThreshold]: (
    change: ProposalListFieldsFragment['terms']['change']
  ) => {
    if (change.__typename === 'UpdateAsset') {
      const proposed =
        change.source.__typename === 'UpdateERC20' &&
        change.source.withdrawThreshold.length > 0;
      return proposed;
    }
    return false;
  },
};

export const isChangeProposed = (
  proposal: Pick<ProposalListFieldsFragment, 'terms'>,
  field: UpdateProposalField
) => {
  if (proposal) {
    return (
      (proposal.terms.change.__typename === 'UpdateAsset' ||
        proposal.terms.change.__typename === 'UpdateMarket') &&
      fieldGetters[field](proposal.terms.change)
    );
  }
  return false;
};
