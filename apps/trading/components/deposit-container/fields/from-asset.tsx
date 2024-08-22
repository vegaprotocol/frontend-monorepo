import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
  TradingRichSelectValue,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { type Control, Controller, useFormContext } from 'react-hook-form';
import { type ChainData, type Token } from '@0xsquid/squid-types';
import { type FormFields } from '../form-schema';
import { FormSecondaryActionWrapper } from '../../form-secondary-action';
import { FormSecondaryActionLink } from '../../form-secondary-action/form-secondary-action';
import { TokenOption } from '../token-option';
import { AssetBalance } from '../../asset-option';

export function FromAsset({
  disabled = false,
  ...props
}: {
  control: Control<FormFields>;
  tokens?: Token[];
  chain?: ChainData | undefined;
  disabled?: boolean;
}) {
  const t = useT();
  const form = useFormContext();
  const fromAssetAddress = form.watch('fromAsset');
  const fromAsset = props.tokens?.find((t) => t.address === fromAssetAddress);

  return (
    <Controller
      name="fromAsset"
      control={props.control}
      render={({ field, fieldState }) => {
        return (
          <FormGroup label={t('From asset')} labelFor="asset">
            {disabled ? (
              <p className="text-surface-1-fg-muted text-xs">
                {t('Swaps not available')}
              </p>
            ) : (
              <>
                <TradingRichSelect
                  placeholder={t('Select asset')}
                  value={field.value}
                  onValueChange={field.onChange}
                  valueElement={
                    fromAsset && (
                      <TradingRichSelectValue placeholder="Select asset">
                        <TokenOption
                          {...fromAsset}
                          balance={
                            <AssetBalance
                              chainId={fromAsset.chainId}
                              address={fromAsset.address}
                            />
                          }
                        />
                      </TradingRichSelectValue>
                    )
                  }
                >
                  {props.tokens?.map((token) => {
                    return (
                      <TradingRichSelectOption
                        value={token.address}
                        key={`${token.chainId}-${token.address}`}
                      >
                        <TokenOption {...token} />
                      </TradingRichSelectOption>
                    );
                  })}
                </TradingRichSelect>
                {fieldState.error && (
                  <TradingInputError>
                    {fieldState.error.message}
                  </TradingInputError>
                )}
              </>
            )}
            {fromAsset && props.chain && (
              <FormSecondaryActionWrapper>
                <FormSecondaryActionLink
                  href={
                    new URL(
                      `address/${fromAsset.address}`,
                      props.chain.blockExplorerUrls[0]
                    ).href
                  }
                  target="_blank"
                >
                  {t('View asset on explorer')}
                </FormSecondaryActionLink>
              </FormSecondaryActionWrapper>
            )}
          </FormGroup>
        );
      }}
    />
  );
}
