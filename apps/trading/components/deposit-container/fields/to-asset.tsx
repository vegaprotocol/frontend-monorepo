import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
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

export function ToAsset(props: {
  control: Control<FormFields>;
  assets: AssetERC20[];
  toAsset: AssetERC20 | undefined;
  queryKey: QueryKey;
}) {
  const t = useT();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();
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
