import { toBigNum } from '@vegaprotocol/utils';
import { useBalance } from 'wagmi';

export const useNativeBalance = (args: {
  address?: string;
  chainId: string | number;
}) => {
  const queryResult = useBalance({
    address: args.address as `0x${string}`,
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
