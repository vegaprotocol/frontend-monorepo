import { z } from 'zod';

import { ETHEREUM_ADDRESS_REGEX, VEGA_ID_REGEX } from '@vegaprotocol/utils';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';

import i18n from '../../lib/i18n';

export const formSchema = z.object({
  fromAddress: z
    .string()
    .regex(ETHEREUM_ADDRESS_REGEX, i18n.t('Connect wallet')),
  fromChain: z.string(),
  fromAsset: z.string(),
  toAsset: z.string().regex(VEGA_ID_REGEX),
  toPubKey: z.string().regex(VEGA_ID_REGEX),
  // Use a string but parse it as a number for validation
  amount: z.string().refine(
    (v) => {
      const n = Number(v);

      if (v?.length <= 0) return false;
      if (isNaN(n)) return false;
      if (n <= 0) return false;

      return true;
    },
    { message: 'Invalid number' }
  ),
});

export type FormFields = z.infer<typeof formSchema>;
export type Configs = Array<EthereumConfig | EVMBridgeConfig>;
