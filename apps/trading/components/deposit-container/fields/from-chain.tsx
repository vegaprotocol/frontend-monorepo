import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller } from 'react-hook-form';
import { type FormFields } from '../form-schema';
import { useT } from '../../../lib/use-t';
import { type ChainData } from '@0xsquid/squid-types';
import { useChainId, useSwitchChain } from 'wagmi';

export function FromChain({
  disabled = false,
  ...props
}: {
  control: Control<FormFields>;
  chains?: ChainData[];
  disabled?: boolean;
}) {
  const t = useT();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  return (
    <Controller
      name="fromChain"
      control={props.control}
      render={({ field, fieldState }) => {
        return (
          <FormGroup label="From chain" labelFor="chain">
            {disabled ? (
              <p className="text-surface-1-fg-muted text-xs">
                {t('Swaps not available')}
              </p>
            ) : (
              <>
                <TradingRichSelect
                  placeholder={t('Select chain')}
                  value={field.value}
                  onValueChange={async (value) => {
                    field.onChange(value);

                    if (value !== String(chainId)) {
                      await switchChainAsync({ chainId: Number(value) });
                    }
                  }}
                >
                  {props.chains?.map((c) => {
                    return (
                      <TradingRichSelectOption
                        value={c.chainId.toString()}
                        key={c.chainId}
                      >
                        <div className="w-full flex items-center gap-2 h-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={t('Logo for {{name}}', {
                              name: c.networkName,
                            })}
                            src={c.chainIconURI}
                            width="30"
                            height="30"
                            className="rounded-full bg-surface-1 border-surface-1 border-2"
                          />
                          <div className="text-sm text-left leading-4">
                            <div>{c.networkName}</div>
                            <div className="text-secondary text-xs">
                              {c.chainId}
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
            )}
          </FormGroup>
        );
      }}
    />
  );
}
