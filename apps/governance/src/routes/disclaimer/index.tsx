import { t } from '@vegaprotocol/i18n';
import type { RouteChildProps } from '..';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Disclaimer = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  return (
    <div className="py-16 px-8 flex w-full justify-center">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl xl:text-5xl uppercase font-alpha calt">
          {t('Disclaimer')}
        </h1>
        <p className="mb-6 mt-10">
          {t(
            'The Vega Governance App allows the Vega network to arrive at on-chain decisions, where tokenholders can create proposals that other tokenholders can vote to approve or reject.  Vega supports on-chain proposals for creating markets and assets, and changing network parameters, markets and assets. Vega also supports freeform proposals for community suggestions that will not be enacted on-chain.'
          )}
        </p>
        <p className="mb-6">
          {t(
            'The Vega Governance App is free, public and open source software.  Software upgrades may contain bugs or security vulnerabilities that might result in loss of functionality.'
          )}
        </p>
        <p className="mb-6">
          {t(
            'The Vega Governance App uses data obtained from nodes on the Vega Blockchain. The developers of the Vega Governance App do not operate or run the Vega Blockchain or any other blockchain.'
          )}
        </p>
        <p className="mb-8">
          {t(
            'The Vega Governance App is provided “as is”.  The developers of the Vega Governance App make no representations or warranties of any kind, whether express or implied, statutory or otherwise regarding the Vega Governance App.  They disclaim all warranties of merchantability, quality, fitness for purpose.  They disclaim all warranties that the Vega Governance App is free of harmful components or errors.'
          )}
        </p>
        <p className="mb-8">
          {t(
            'No developer of the Vega Governance App accepts any responsibility for, or liability to users in connection with their use of the Vega Governance App.'
          )}
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
