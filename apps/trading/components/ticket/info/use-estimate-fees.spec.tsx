import { renderHook, waitFor } from '@testing-library/react';
import { useEstimateFees, type UseEstimateFeesArgs } from './use-estimate-fees';
import { MockedProvider, type MockedResponse } from '@apollo/react-testing';
import {
  MarketTradingMode,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import { type FormFieldsLimit } from '../schemas';
import {
  EstimateFeesDocument,
  type EstimateFeesQuery,
  type EstimateFeesQueryVariables,
} from '../__generated__/EstimateFees';
import { removeDecimal } from '@vegaprotocol/utils';

type Mock = MockedResponse<EstimateFeesQuery, EstimateFeesQueryVariables>;

describe('useEstimateFees', () => {
  const setup = (args: UseEstimateFeesArgs, mock: Mock) => {
    return renderHook(() => useEstimateFees(args), {
      wrapper: (props) => <MockedProvider {...props} mocks={[mock]} />,
    });
  };

  it('calculates fees accordingly', async () => {
    const values = {
      ticketType: 'limit',
      type: OrderType.TYPE_LIMIT,
      size: 10,
      price: 100,
      postOnly: false,
      side: Side.SIDE_BUY,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
    };
    const args: UseEstimateFeesArgs = {
      useOcoFields: false,
      partyId: 'partyId',
      marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      markPrice: 'markPrice',
      values: values as FormFieldsLimit,
      market: {
        id: 'marketId',
        decimalPlaces: 2,
        positionDecimalPlaces: 2,
      },
    };

    const mock: Mock = {
      request: {
        query: EstimateFeesDocument,
        variables: {
          marketId: args.market.id,
          partyId: args.partyId as string,
          type: args.values.type,
          // @ts-ignore price has to present and can be taken from current
          // market price
          price: removeDecimal(
            values.price.toString(),
            args.market.decimalPlaces
          ),
          size: removeDecimal(
            values.size.toString(),
            args.market.positionDecimalPlaces
          ),
          side: args.values.side,
          timeInForce: args.values.timeInForce,
        },
      },
      result: {
        data: {
          estimateFees: {
            fees: {
              makerFee: '10',
              infrastructureFee: '10',
              liquidityFee: '10',
              buyBackFee: '10',
              treasuryFee: '10',
              highVolumeMakerFee: '10',
              makerFeeReferralDiscount: '1',
              makerFeeVolumeDiscount: '1',
              infrastructureFeeReferralDiscount: '1',
              infrastructureFeeVolumeDiscount: '1',
              liquidityFeeReferralDiscount: '1',
              liquidityFeeVolumeDiscount: '1',
            },
            totalFeeAmount: '100',
          },
        },
      },
    };

    const { result } = setup(args, mock);

    await waitFor(() => {
      expect(result.current.fee.toString()).toEqual('66');
      expect(result.current.feeDiscounted.toString()).toEqual('60');
      expect(result.current.discount.toString()).toEqual('6');
      expect(result.current.discountPct.toFixed(2)).toEqual('9.09');
      expect(result.current.makerRebate.toString()).toEqual('10');
      expect(result.current.makerRebatePct.toString()).toEqual('100');
    });
  });

  it('calculates fees in auction', async () => {
    const values = {
      ticketType: 'limit',
      type: OrderType.TYPE_LIMIT,
      size: 10,
      price: 100,
      postOnly: false,
      side: Side.SIDE_BUY,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
    };
    const args: UseEstimateFeesArgs = {
      useOcoFields: false,
      partyId: 'partyId',
      marketTradingMode: MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
      markPrice: 'markPrice',
      values: values as FormFieldsLimit,
      market: {
        id: 'marketId',
        decimalPlaces: 2,
        positionDecimalPlaces: 2,
      },
    };

    const mock: Mock = {
      request: {
        query: EstimateFeesDocument,
        variables: {
          marketId: args.market.id,
          partyId: args.partyId as string,
          type: args.values.type,
          // @ts-ignore price has to present and can be taken from current
          // market price
          price: removeDecimal(
            values.price.toString(),
            args.market.decimalPlaces
          ),
          size: removeDecimal(
            values.size.toString(),
            args.market.positionDecimalPlaces
          ),
          side: args.values.side,
          timeInForce: args.values.timeInForce,
        },
      },
      result: {
        data: {
          estimateFees: {
            fees: {
              makerFee: '10',
              infrastructureFee: '10',
              liquidityFee: '10',
              buyBackFee: '10',
              treasuryFee: '10',
              highVolumeMakerFee: '10',
              makerFeeReferralDiscount: '1',
              makerFeeVolumeDiscount: '1',
              infrastructureFeeReferralDiscount: '1',
              infrastructureFeeVolumeDiscount: '1',
              liquidityFeeReferralDiscount: '1',
              liquidityFeeVolumeDiscount: '1',
            },
            totalFeeAmount: '100',
          },
        },
      },
    };

    const { result } = setup(args, mock);

    await waitFor(() => {
      expect(result.current.fee.toString()).toEqual('33');
      expect(result.current.feeDiscounted.toString()).toEqual('30');
      expect(result.current.discount.toString()).toEqual('3');
      expect(result.current.discountPct.toFixed(2)).toEqual('9.09');
      expect(result.current.makerRebate.toString()).toEqual('5');
      expect(result.current.makerRebatePct.toString()).toEqual('100');
    });
  });
});
