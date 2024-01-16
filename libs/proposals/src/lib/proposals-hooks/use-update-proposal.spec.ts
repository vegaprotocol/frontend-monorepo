/* eslint-disable jest/no-conditional-expect */
import { renderHook } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';

import type {
  ProposalListFieldsFragment,
  UpdateAssetFieldsFragment,
  UpdateMarketFieldsFragment,
} from '../proposals-data-provider';
import {
  isChangeProposed,
  UpdateAssetFields,
  UpdateMarketFields,
  useUpdateProposal,
} from './use-update-proposal';

type Proposal = Pick<ProposalListFieldsFragment, 'terms'> &
  Pick<ProposalListFieldsFragment, 'state'> &
  Pick<ProposalListFieldsFragment, 'id'>;

const generateUpdateAssetProposal = (
  id: string,
  quantum = '',
  lifetimeLimit = '',
  withdrawThreshold = ''
): Proposal => ({
  id,
  state: Schema.ProposalState.STATE_OPEN,
  terms: {
    __typename: 'ProposalTerms',
    closingDatetime: '',
    enactmentDatetime: undefined,
    change: {
      __typename: 'UpdateAsset',
      assetId: id,
      quantum,
      source: {
        __typename: 'UpdateERC20',
        lifetimeLimit,
        withdrawThreshold,
      },
    },
  },
});

type RiskParameters =
  | {
      __typename: 'UpdateMarketLogNormalRiskModel';
      logNormal?: {
        __typename?: 'LogNormalRiskModel';
        riskAversionParameter: number;
        tau: number;
        params: {
          __typename?: 'LogNormalModelParams';
          mu: number;
          r: number;
          sigma: number;
        };
      } | null;
    }
  | {
      __typename: 'UpdateMarketSimpleRiskModel';
      simple?: {
        __typename?: 'SimpleRiskModelParams';
        factorLong: number;
        factorShort: number;
      } | null;
    };

const generateRiskParameters = (
  type:
    | 'UpdateMarketLogNormalRiskModel'
    | 'UpdateMarketSimpleRiskModel' = 'UpdateMarketLogNormalRiskModel'
): RiskParameters => {
  if (type === 'UpdateMarketSimpleRiskModel')
    return {
      __typename: 'UpdateMarketSimpleRiskModel',
      simple: {
        __typename: 'SimpleRiskModelParams',
        factorLong: 0,
        factorShort: 0,
      },
    };

  return {
    __typename: 'UpdateMarketLogNormalRiskModel',
    logNormal: {
      __typename: 'LogNormalRiskModel',
      params: {
        __typename: 'LogNormalModelParams',
        mu: 0,
        r: 0,
        sigma: 0,
      },
      riskAversionParameter: 0,
      tau: 0,
    },
  };
};

const generateUpdateMarketProposal = (
  id: string,
  code = '',
  quoteName = '',
  priceMonitoring = false,
  liquidityMonitoring = false,
  riskParameters = false,
  riskParametersType:
    | 'UpdateMarketLogNormalRiskModel'
    | 'UpdateMarketSimpleRiskModel' = 'UpdateMarketLogNormalRiskModel'
): Proposal => ({
  state: Schema.ProposalState.STATE_OPEN,
  terms: {
    __typename: 'ProposalTerms',
    closingDatetime: '',
    enactmentDatetime: undefined,
    change: {
      __typename: 'UpdateMarket',
      marketId: id,
      updateMarketConfiguration: {
        __typename: undefined,
        instrument: {
          __typename:
            code.length > 0 || quoteName.length > 0
              ? 'UpdateInstrumentConfiguration'
              : undefined,
          code,
          product: {
            dataSourceSpecBinding: {
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename:
              quoteName.length > 0 ? 'UpdateFutureProduct' : undefined,
            quoteName,
          },
        },
        priceMonitoringParameters: {
          __typename: priceMonitoring ? 'PriceMonitoringParameters' : undefined,
          triggers: priceMonitoring
            ? [
                {
                  auctionExtensionSecs: 1,
                  horizonSecs: 2,
                  probability: 3,
                  __typename: 'PriceMonitoringTrigger',
                },
              ]
            : [],
        },
        liquidityMonitoringParameters: {
          __typename: liquidityMonitoring
            ? 'LiquidityMonitoringParameters'
            : undefined,
          targetStakeParameters: {
            __typename: undefined,
            scalingFactor: 0,
            timeWindow: 0,
          },
        },
        riskParameters: riskParameters
          ? generateRiskParameters(riskParametersType)
          : {
              __typename: riskParametersType,
            },
      },
    },
  },
});

const mockDataProviderData: {
  data: Proposal[];
  error: Error | undefined;
  loading: boolean;
} = {
  data: [
    generateUpdateMarketProposal('123'),
    generateUpdateAssetProposal('456'),
  ],
  error: undefined,
  loading: false,
};

const mockDataProvider = jest.fn(() => {
  return mockDataProviderData;
});
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((args) => mockDataProvider()),
}));

describe('useUpdateProposal', () => {
  it('returns update proposal for a given asset', () => {
    const { result } = renderHook(() =>
      useUpdateProposal({
        id: '456',
        proposalType: Schema.ProposalType.TYPE_UPDATE_ASSET,
      })
    );
    const change = result.current.data?.terms
      .change as UpdateAssetFieldsFragment;
    expect(change.__typename).toEqual('UpdateAsset');
    expect(change.assetId).toEqual('456');
  });

  it('returns update proposal for a given market', () => {
    const { result } = renderHook(() =>
      useUpdateProposal({
        id: '123',
        proposalType: Schema.ProposalType.TYPE_UPDATE_MARKET,
      })
    );
    const change = result.current.data?.terms
      .change as UpdateMarketFieldsFragment;
    expect(change.__typename).toEqual('UpdateMarket');
    expect(change.marketId).toEqual('123');
  });

  it('does not return a proposal if not found', () => {
    const { result } = renderHook(() =>
      useUpdateProposal({
        id: '789',
        proposalType: Schema.ProposalType.TYPE_UPDATE_MARKET,
      })
    );
    expect(result.current.data).toBeFalsy();
  });
});

describe('isChangeProposed', () => {
  it('returns false if a change for the specified asset field is not proposed', () => {
    const proposal = generateUpdateAssetProposal('123');
    expect(isChangeProposed(proposal, UpdateAssetFields.Quantum)).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateAssetFields.LifetimeLimit)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateAssetFields.WithdrawThreshold)
    ).toBeFalsy();
  });

  it('returns true if a change for the specified asset field is proposed', () => {
    const proposal = generateUpdateAssetProposal('123', '100', '100', '100');
    expect(isChangeProposed(proposal, UpdateAssetFields.Quantum)).toBeTruthy();
    expect(
      isChangeProposed(proposal, UpdateAssetFields.LifetimeLimit)
    ).toBeTruthy();
    expect(
      isChangeProposed(proposal, UpdateAssetFields.WithdrawThreshold)
    ).toBeTruthy();
  });

  it('returns false if a change for the specified market field is not proposed', () => {
    const proposal = generateUpdateMarketProposal('123');
    expect(isChangeProposed(proposal, UpdateMarketFields.Code)).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.QuoteName)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.PriceMonitoring)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.LiquidityMonitoring)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.RiskParameters)
    ).toBeFalsy();
  });

  it('returns true if a change for the specified market field is proposed', () => {
    const proposal = generateUpdateMarketProposal(
      '123',
      'ABCDEF',
      'qABCDEFq',
      true,
      true,
      true
    );
    expect(isChangeProposed(proposal, UpdateMarketFields.Code)).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.QuoteName)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.PriceMonitoring)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.LiquidityMonitoring)
    ).toBeFalsy();
    expect(
      isChangeProposed(proposal, UpdateMarketFields.RiskParameters)
    ).toBeFalsy();
  });
});
