import { t } from '@vegaprotocol/react-helpers';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

// TODO: add mainnet links once docs have been updated
const LINKS = {
  testnet: [
    {
      label: 'Understand how liquidity fees are calculated',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#resources',
    },
    {
      label: 'How to provide liquidity',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#overview',
    },
    {
      label: 'How to view existing liquidity provisions',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#viewing-existing-liquidity-provisions',
    },
    {
      label: 'How to amend or remove liquidity',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#amending-a-liquidity-commitment',
    },
  ],
  mainnet: [],
};

// TODO: update this when network switcher is added
type Network = 'testnet' | 'mainnet';

export const Intro = ({ network = 'testnet' }: { network?: Network }) => {
  return (
    <div className="mb-6 px-6 py-6 bg-neutral-100" data-testid="intro">
      <h2 className="text-xl font-medium mb-1">
        {t('Become a liquidity provider')}
      </h2>
      <p className="text-base mb-2">
        {t('Earn a cut of the fees paid by price takers during trading.')}
      </p>
      <div>
        <ul className="flex flex-wrap">
          {LINKS[network].map(
            ({ label, url }: { label: string; url: string }) => (
              <li key={url} className="mr-6">
                <ExternalLink href={url} rel="noreferrer">
                  {t(label)}
                </ExternalLink>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};
