import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../components/route-title';

export const Disclaimer = () => {
  return (
    <section>
      <div className="max-w-5xl px-40 mb-4 max-sm:px-0 max-md:px-10">
        <RouteTitle data-testid="disclaimer-header">
          {t('Disclaimer')}
        </RouteTitle>
        <p className="mt-3">
          The Vega Block Explorer is an application that allows users to, among
          other things, browse through blocks, view wallet addresses, network
          hashrate, transaction data and other key information on the Vega
          blockchain. It is free, public and open source software. Software
          upgrades may contain bugs or security vulnerabilities that might
          result in loss of functionality.
        </p>
        <p className="mt-3">
          The Vega Block Explorer uses data from nodes on the Vega Blockchain.
          The developers of the Vega Block Explorer do not operate or run the
          Vega Blockchain or any other blockchain.
        </p>
        <p className="mt-3 font-semibold">
          The Vega Block Explorer is provided “as is”. The developers of the
          Vega Block Explorer make no representations or warranties of any kind,
          whether express or implied, statutory or otherwise regarding the Vega
          Block Explorer. They disclaim all warranties of merchantability,
          quality, fitness for purpose. They disclaim all warranties that the
          Vega Block Explorer is free of harmful components or errors.
        </p>
        <p className="mt-3 font-bold">
          No developer of the Vega Block Explorer accepts any responsibility
          for, or liability to users in connection with their use of the Vega
          Block Explorer.
        </p>
      </div>
    </section>
  );
};
