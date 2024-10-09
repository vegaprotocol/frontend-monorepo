import { FormGroup } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { type Token } from '@0xsquid/squid-types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { type AssetERC20 } from '@vegaprotocol/assets';

export function Receives(props: {
  amount: string | undefined;
  token: Token | undefined;
  toAsset: AssetERC20 | undefined;
}) {
  const t = useT();

  if (!props.toAsset) return null;

  return (
    <FormGroup label={t('Receive')} labelFor="receive">
      {props.amount && props.token ? (
        <div>
          {addDecimalsFormatNumber(props.amount, props.token.decimals)}{' '}
          {props.token.symbol}
        </div>
      ) : (
        <div>0 {props.toAsset.symbol}</div>
      )}
    </FormGroup>
  );
}
