import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { t } from '@vegaprotocol/react-helpers';
import { Button, Input, Dialog } from '@vegaprotocol/ui-toolkit';

type Web3WalletInputProps = {
  inputProps: Partial<
    Omit<
      ComponentProps<typeof Input>,
      'appendIconName' | 'prependIconName' | 'appendElement' | 'prependElement'
    >
  >;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const Web3WalletInput = ({ inputProps }: Web3WalletInputProps) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { account, connector } = useWeb3React();

  return (
    <>
      <Input
        {...inputProps}
        appendIconName="chevron-down"
        className="cursor-pointer select-none"
        onChange={noop}
        onClick={() => setDialogOpen(true)}
      />
      <Dialog open={isDialogOpen} onChange={setDialogOpen}>
        <p className="mb-16">
          {t('Connected with ')}
          <span className="font-mono">{account}</span>
        </p>
        <Button onClick={() => connector.deactivate()}>
          {t('Disconnect Ethereum Wallet')}
        </Button>
      </Dialog>
    </>
  );
};
