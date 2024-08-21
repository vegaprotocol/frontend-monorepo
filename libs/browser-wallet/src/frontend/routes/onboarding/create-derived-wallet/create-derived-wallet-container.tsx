import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { ConnectKitButton } from 'connectkit';
import { type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { CreateDerivedWalletPage } from './create-derived-wallet-page';

export const CreateDerivedWalletContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return (
      <CreateDerivedWalletPage>
        <div className="text-center">
          <ConnectKitButton.Custom>
            {({ show }) => {
              return (
                <Button
                  intent={Intent.Primary}
                  onClick={() => {
                    if (show) show();
                  }}
                >
                  Connect Ethereum Wallet
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </CreateDerivedWalletPage>
    );
  }
  return children;
};
