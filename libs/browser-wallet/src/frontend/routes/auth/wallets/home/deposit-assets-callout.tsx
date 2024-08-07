import { ExternalLink } from '@/components/external-link';
import { Frame } from '@/components/frame';
import { useNetwork } from '@/contexts/network/network-context';

export const locators = {
  walletsAssetHeader: 'wallets-asset-header',
  walletAssetDescription: 'wallets-asset-description',
  walletsDepositLink: 'wallets-deposit-link',
};

export const DepositAssetsCallout = () => {
  const { network } = useNetwork();

  return (
    <section className="mt-10">
      <Frame>
        <h1
          data-testid={locators.walletsAssetHeader}
          className="mb-3 text-vega-dark-300 uppercase text-sm"
        >
          Connect to console to deposit funds
        </h1>
        <p className="mb-3" data-testid={locators.walletAssetDescription}>
          Choose a market on Vega Console, connect your wallet and follow the
          prompts to deposit the funds needed to trade
        </p>
        <ExternalLink
          data-testid={locators.walletsDepositLink}
          className="break-word text-white"
          href={network.console}
        >
          Vega Console dapp
        </ExternalLink>
      </Frame>
    </section>
  );
};
