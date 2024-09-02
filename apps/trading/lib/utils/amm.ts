import type {
  AmendAMMFormFields,
  SubmitAMMFormFields,
} from '../../components/amm/liquidity-form-schema';
import {
  type AmendAMMBody,
  type CancelAMMBody,
  CancelAMMMethod,
  type SubmitAMMBody,
} from '@vegaprotocol/wallet';
import { Decimal, type Asset } from '@vegaprotocol/rest';

export const createSubmitAmmTransaction = (
  {
    marketId,
    amount,
    fee,
    slippageTolerance,
    upperBound,
    lowerBound,
    base,
    leverageAtUpperBound,
    leverageAtLowerBound,
  }: SubmitAMMFormFields,
  quoteAsset: Asset
) => {
  // required fields
  const _amount = Decimal.toString(amount, quoteAsset.decimals);
  const _fee = String(fee);
  const _slippageTolerance = String(slippageTolerance);
  const _base = Decimal.toString(base, quoteAsset.decimals);

  // optional fields
  const _upperBound = Decimal.toString(upperBound, quoteAsset.decimals);
  const _leverageAtUpperBound = Decimal.toString(
    leverageAtUpperBound,
    quoteAsset.decimals
  );
  const _lowerBound = Decimal.toString(lowerBound, quoteAsset.decimals);
  const _leverageAtLowerBound = Decimal.toString(
    leverageAtLowerBound,
    quoteAsset.decimals
  );

  if (!_amount) {
    throw new Error('missing _amount');
  }

  if (!_base) {
    throw new Error('missing _base');
  }

  const tx: SubmitAMMBody = {
    submitAmm: {
      marketId,
      commitmentAmount: _amount,
      slippageTolerance: _slippageTolerance,
      concentratedLiquidityParameters: {
        upperBound: _upperBound,
        lowerBound: _lowerBound,
        base: _base,
        leverageAtUpperBound: _leverageAtUpperBound,
        leverageAtLowerBound: _leverageAtLowerBound,
      },
      proposedFee: _fee,
    },
  };

  return tx;
};

export const createAmendAmmTransaction = (
  {
    marketId,
    amount,
    fee,
    slippageTolerance,
    upperBound,
    lowerBound,
    base,
    leverageAtUpperBound,
    leverageAtLowerBound,
  }: AmendAMMFormFields,
  quoteAsset: Asset
) => {
  // required fields
  const _slippageTolerance = String(slippageTolerance);

  // optional fields
  const _amount = Decimal.toString(amount, quoteAsset.decimals);
  const _fee = fee ? String(fee) : undefined;
  const _base = Decimal.toString(base, quoteAsset.decimals);
  const _upperBound = Decimal.toString(upperBound, quoteAsset.decimals);
  const _leverageAtUpperBound = Decimal.toString(
    leverageAtUpperBound,
    quoteAsset.decimals
  );
  const _lowerBound = Decimal.toString(lowerBound, quoteAsset.decimals);
  const _leverageAtLowerBound = Decimal.toString(
    leverageAtLowerBound,
    quoteAsset.decimals
  );

  const withParams = !!_base;

  const tx: AmendAMMBody = {
    amendAmm: {
      marketId,
      commitmentAmount: _amount,
      slippageTolerance: _slippageTolerance,
      concentratedLiquidityParameters: withParams
        ? {
            upperBound: _upperBound,
            lowerBound: _lowerBound,
            base: _base,
            leverageAtUpperBound: _leverageAtUpperBound,
            leverageAtLowerBound: _leverageAtLowerBound,
          }
        : undefined,
      proposedFee: _fee,
    },
  };

  return tx;
};

export const createCancelAmmTransaction = (
  marketId: string,
  method = CancelAMMMethod.METHOD_IMMEDIATE
) => {
  const tx: CancelAMMBody = {
    cancelAmm: {
      marketId,
      method,
    },
  };
  return tx;
};
