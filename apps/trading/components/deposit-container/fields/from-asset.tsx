import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
  TradingRichSelectValue,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { type Control, Controller } from 'react-hook-form';
import { type ChainData, type Token } from '@0xsquid/squid-types';
import { type FormFields } from '../deposit-form';
import { FormSecondaryActionWrapper } from '../../form-secondary-action';
import { FormSecondaryActionLink } from '../../form-secondary-action/form-secondary-action';
import { AssetBalance } from '../../asset-option';

export function FromAsset(props: {
  control: Control<FormFields>;
  tokens: Token[];
  fromAsset: Token | undefined;
  chain: ChainData | undefined;
}) {
  const t = useT();
  return (
    <FormGroup label="From asset" labelFor="asset">
      <div className="flex flex-col gap-1">
        <Controller
          name="fromAsset"
          control={props.control}
          render={({ field, fieldState }) => {
            return (
              <>
                <TradingRichSelect
                  placeholder="Select asset"
                  value={field.value}
                  onValueChange={field.onChange}
                  valueElement={
                    props.fromAsset && (
                      <TradingRichSelectValue placeholder="Select asset">
                        <div className="w-full flex items-center gap-2 h-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={t('Logo for {{name}}', {
                              name: props.fromAsset.name,
                            })}
                            src={props.fromAsset.logoURI}
                            width="30"
                            height="30"
                            className="rounded-full bg-gs-600 border-gs-600 border-2"
                          />
                          <div className="text-sm text-left leading-4">
                            <div>
                              {props.fromAsset.name} {props.fromAsset.symbol}
                            </div>
                            <div className="text-secondary text-xs">
                              {props.fromAsset.address}
                            </div>
                          </div>
                          <div className="ml-auto text-sm">
                            <AssetBalance
                              chainId={props.fromAsset.chainId}
                              address={props.fromAsset.address}
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
                  <TradingInputError>
                    {fieldState.error.message}
                  </TradingInputError>
                )}
              </>
            );
          }}
        />
      </div>
      {props.fromAsset && props.chain && (
        <FormSecondaryActionWrapper>
          <FormSecondaryActionLink
            href={
              new URL(
                `address/${props.fromAsset.address}`,
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
}
