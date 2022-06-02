import type { Networks } from '@vegaprotocol/smart-contracts';

type NetworkState = {
  network: Networks;
  url?: string;
};

type NetworkSwitcherProps = {
  onConfirm: (network: NetworkState) => void;
};

export const NetworkSwitcher = () => {
  return <div />;
};
