import { useEagerConnect } from '@vegaprotocol/wallet-react';

export const MaybeConnectEagerly = () => {
  useEagerConnect();

  return null;
};
