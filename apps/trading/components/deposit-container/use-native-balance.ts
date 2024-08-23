import { type Address } from 'viem';
import { useBalance } from 'wagmi';

import { toBigNum } from '@vegaprotocol/utils';

export const useNativeBalance = (args: {
  address?: string;
  chainId: string | number;
}) => {
  const queryResult = useBalance({
    address: args.address as Address,
    chainId: Number(args.chainId),
  });
  const nativeBalance = queryResult.data
    ? toBigNum(queryResult.data.value.toString(), queryResult.data.decimals)
    : undefined;

  return {
    ...queryResult,
    data: nativeBalance,
  };
};
