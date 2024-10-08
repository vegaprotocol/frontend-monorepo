import { z } from 'zod';

import { ETHEREUM_ADDRESS_REGEX, VEGA_ID_REGEX } from '@vegaprotocol/utils';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';

import i18n from '../../lib/i18n';
import { useMemo } from 'react';

type SchemaArgs = { minAmount?: string };

export const createFormSchema = ({ minAmount = '0' }: SchemaArgs) => {
  return z.object({
    fromAddress: z
      .string()
      .regex(ETHEREUM_ADDRESS_REGEX, i18n.t('Connect wallet')),
    fromChain: z.string(),
    fromAsset: z.string(),
    toAsset: z.string().regex(VEGA_ID_REGEX),
    toPubKey: z.string().regex(VEGA_ID_REGEX),
    // Use a string but parse it as a number for validation
    amount: z.coerce.number().min(Number(minAmount)),
  });
};

export const createFallbackFormSchema = (args: SchemaArgs) => {
  return createFormSchema(args).partial({ fromAsset: true });
};

export type FormFields = z.infer<ReturnType<typeof createFormSchema>>;
export type Configs = Array<EthereumConfig | EVMBridgeConfig>;

export const useFormSchema = (args: SchemaArgs) => {
  return useMemo(() => createFormSchema(args), [args]);
};

export const useFallbackFormSchema = (args: SchemaArgs) => {
  return useMemo(() => createFallbackFormSchema(args), [args]);
};
