import { t } from '@vegaprotocol/react-helpers';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

// TODO: add mainnet links once docs have been updated
const LINKS = {
  testnet: [
    {
      label: 'Learn about liquidity fees',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#resources',
    },
    {
      label: 'Provide liquidity',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#overview',
    },
    {
      label: 'View your liquidity provisions',
      url: 'https://docs.vega.xyz/docs/testnet/tutorials/providing-liquidity#viewing-existing-liquidity-provisions',
    },
    {
      label: 'Amend or remove liquidity',
      url: 'https://docs.vega.xyz/testnet/tutorials/providing-liquidity#amending-a-liquidity-commitment',
    },
  ],
  mainnet: [],
};

// TODO: update this when network switcher is added
type Network = 'testnet' | 'mainnet';

export const Intro = ({ network = 'testnet' }: { network?: Network }) => {
  return (
    <div className="mb-6 px-6 py-6 border rounded-2xl" data-testid="intro">
      <p className="font-alpha text-2xl font-medium mb-2">
        {t(
          'Become a liquidity provider and earn a cut of the fees paid during trading.'
        )}
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
