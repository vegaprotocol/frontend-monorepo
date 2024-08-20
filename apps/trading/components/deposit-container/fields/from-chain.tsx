import {
  FormGroup,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller } from 'react-hook-form';
import { type FormFields } from '../deposit-form';
import { useT } from '../../../lib/use-t';
import { type ChainData } from '@0xsquid/squid-types';

export function FromChain(props: {
  control: Control<FormFields>;
  chains: ChainData[];
}) {
  const t = useT();
  return (
    <FormGroup label="From chain" labelFor="chain">
      <Controller
        name="fromChain"
        control={props.control}
        render={({ field, fieldState }) => {
          return (
            <>
              <TradingRichSelect
                placeholder="Select chain"
                value={field.value}
                onValueChange={field.onChange}
              >
                {props.chains.map((c) => {
                  return (
                    <TradingRichSelectOption
                      value={c.chainId.toString()}
                      key={c.chainId}
                    >
                      <div className="w-full flex items-center gap-2 h-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={t('Logo for {{name}}', { name: c.networkName })}
                          src={c.chainIconURI}
                          width="30"
                          height="30"
                          className="rounded-full bg-gs-600 border-gs-600 border-2"
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
          );
        }}
      />
    </FormGroup>
  );
}
