import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
  TradingRichSelectValue,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller } from 'react-hook-form';
import { AssetOption } from '../../asset-option';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../../form-secondary-action';
import { Faucet } from '../faucet';
import { type FormFields } from '../form-schema';
import { isAssetUSDTArb } from '../../../lib/utils/is-asset-usdt-arb';
import { useT } from '../../../lib/use-t';
import {
  type AssetERC20,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { type QueryKey } from '@tanstack/react-query';
import { type RouteResponse } from '@0xsquid/sdk/dist/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { TokenOption } from '../token-option';

export function ToAsset(props: {
  control: Control<FormFields>;
  assets: AssetERC20[];
  toAsset: AssetERC20 | undefined;
  queryKey: QueryKey;
  route?: RouteResponse['route'];
}) {
  const t = useT();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();
  const estimate = props.route?.estimate;
  const token = estimate?.toToken;

  return (
    <Controller
      name="toAsset"
      control={props.control}
      render={({ field, fieldState }) => {
        return (
          <FormGroup label={t('To asset')} labelFor="asset">
            <TradingRichSelect
              placeholder={t('Select asset')}
              value={field.value}
              onValueChange={field.onChange}
              valueElement={
                estimate &&
                token && (
                  <TradingRichSelectValue placeholder="Select asset">
                    <TokenOption
                      {...token}
                      balance={
                        <>
                          {addDecimalsFormatNumber(
                            estimate.toAmount,
                            token.decimals
                          )}
                        </>
                      }
                    />
                  </TradingRichSelectValue>
                )
              }
            >
              {props.assets.map((a) => {
                return (
                  <TradingRichSelectOption value={a.id} key={a.id}>
                    <AssetOption asset={a} />
                  </TradingRichSelectOption>
                );
              })}
            </TradingRichSelect>
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
            {props.toAsset && !isAssetUSDTArb(props.toAsset) && (
              <TradingInputError intent="warning">
                {t(
                  'The majority of markets on the network settle in USDT Arb. Are you sure you wish to deposit the selected asset?'
                )}
              </TradingInputError>
            )}
            {props.toAsset && (
              <FormSecondaryActionWrapper>
                <FormSecondaryActionButton
                  onClick={() => {
                    if (!props.toAsset) return;
                    openAssetDialog(props.toAsset.id);
                  }}
                >
                  {t('View asset details')}
                </FormSecondaryActionButton>
                <Faucet asset={props.toAsset} queryKey={props.queryKey} />
              </FormSecondaryActionWrapper>
            )}
          </FormGroup>
        );
      }}
    />
  );
}
