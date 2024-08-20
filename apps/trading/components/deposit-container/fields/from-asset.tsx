import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
  TradingRichSelectValue,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { type Control, Controller, useForm } from 'react-hook-form';
import { type ChainData, type Token } from '@0xsquid/squid-types';
import { type FormFields } from '../deposit-form';
import { FormSecondaryActionWrapper } from '../../form-secondary-action';
import { FormSecondaryActionLink } from '../../form-secondary-action/form-secondary-action';
import { AssetBalance } from '../../asset-option';

export function FromAsset(props: {
  control: Control<FormFields>;
  tokens: Token[];
  chain: ChainData | undefined;
}) {
  const t = useT();
  const form = useForm();
  const fromAssetAddress = form.watch('fromAsset');
  const fromAsset = props.tokens?.find((t) => t.address === fromAssetAddress);
  return (
    <Controller
      name="fromAsset"
      control={props.control}
      render={({ field, fieldState }) => {
        return (
          <FormGroup label={t('From asset')} labelFor="asset">
            <TradingRichSelect
              placeholder={t('Select asset')}
              value={field.value}
              onValueChange={field.onChange}
              valueElement={
                fromAsset && (
                  <TradingRichSelectValue placeholder="Select asset">
                    <div className="w-full flex items-center gap-2 h-10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={t('Logo for {{name}}', {
                          name: fromAsset.name,
                        })}
                        src={fromAsset.logoURI}
                        width="30"
                        height="30"
                        className="rounded-full bg-gs-600 border-gs-600 border-2"
                      />
                      <div className="text-sm text-left leading-4">
                        <div>
                          {fromAsset.name} {fromAsset.symbol}
                        </div>
                        <div className="text-secondary text-xs">
                          {fromAsset.address}
                        </div>
                      </div>
                      <div className="ml-auto text-sm">
                        <AssetBalance
                          chainId={fromAsset.chainId}
                          address={fromAsset.address}
                        />
                      </div>
                    </div>
                  </TradingRichSelectValue>
                )
              }
            >
              {props.tokens.map((token) => {
                return (
                  <TradingRichSelectOption
                    value={token.address}
                    key={`${token.chainId}-${token.address}`}
                  >
                    <div className="w-full flex items-center gap-2 h-10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={t('Logo for {{name}}', { name: token.name })}
                        src={token.logoURI}
                        width="30"
                        height="30"
                        className="rounded-full bg-gs-600 border-gs-600 border-2"
                      />
                      <div className="text-sm text-left leading-4">
                        <div>
                          {token.name} {token.symbol}
                        </div>
                        <div className="text-secondary text-xs">
                          {token.address}
                        </div>
                      </div>
                    </div>
                  </TradingRichSelectOption>
                );
              })}
            </TradingRichSelect>
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
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
