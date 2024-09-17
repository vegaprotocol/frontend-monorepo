import merge from 'lodash/merge';
import { type PartialDeep } from 'type-fest';
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
  const createMock = (args: UseEstimateFeesArgs) => {
    const mock: Mock = {
      request: {
        query: EstimateFeesDocument,
        variables: {
          marketId: args.market.id,
          partyId: args.partyId as string,
          type: args.values.type,
          price: removeDecimal(
            // @ts-ignore price has to present and can be taken from current
            // market price
            String(args.values.price),
            args.market.decimalPlaces
          ),
          size: removeDecimal(
            String(args.values.size),
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
    return mock;
  };

  const createArgs = (override?: PartialDeep<UseEstimateFeesArgs>) => {
    const args: UseEstimateFeesArgs = {
      useOcoFields: false,
      partyId: 'partyId',
      marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      markPrice: '100',
      values: {
        ticketType: 'limit',
        type: OrderType.TYPE_LIMIT,
        size: 10,
        price: 100,
        postOnly: false,
        side: Side.SIDE_BUY,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      } as FormFieldsLimit,
      market: {
        id: 'marketId',
        decimalPlaces: 2,
        positionDecimalPlaces: 2,
      },
    };
    return merge(args, override);
  };

  const setup = (args: UseEstimateFeesArgs, mock: Mock) => {
    return renderHook(() => useEstimateFees(args), {
      wrapper: (props) => <MockedProvider {...props} mocks={[mock]} />,
    });
  };

  it('returns zero if order is postOnly', async () => {
    const args = createArgs({
      values: {
        postOnly: true,
      },
    });
    const mock = createMock(args);
    const { result } = setup(args, mock);

    await waitFor(() => {
      expect(result.current.fee.toString()).toEqual('0');
      expect(result.current.feeDiscounted.toString()).toEqual('0');
      expect(result.current.discount.toString()).toEqual('0');
      expect(result.current.discountPct.toString()).toEqual('0');
      expect(result.current.makerRebate.toString()).toEqual('0');
      expect(result.current.makerRebatePct.toString()).toEqual('0');
    });
  });

  it('calculates fees accordingly', async () => {
    const args = createArgs();
    const mock = createMock(args);
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

  it('halves fees in auction mode', async () => {
    const args = createArgs({
      marketTradingMode: MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    });
    const mock = createMock(args);

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
