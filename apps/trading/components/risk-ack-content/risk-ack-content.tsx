import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';

export const RiskAckContent = () => {
  const t = useT();
  return (
    <>
      <div className="p-6 bg-gs-800">
        <ul className="list-[square] ml-4">
          <li className="mb-1">
            {t(
              'Conduct your own due diligence and consult your financial advisor before making any investment decisions.'
            )}
          </li>
          <li className="mb-1">
            {t(
              'You may encounter bugs, loss of functionality or loss of assets.'
            )}
          </li>
          <li>
            {t('No party accepts any liability for any losses whatsoever.')}
          </li>
        </ul>
      </div>
      <p>
        <Trans
          defaults="By using the Vega Console, you acknowledge that you have read and understood the <0>Vega Console Disclaimer</0>"
          components={[<DisclaimerLink key="link" />]}
        />
      </p>
    </>
  );
};

const DisclaimerLink = ({ children }: { children?: string[] }) => (
  <Link
    className="flex-inline items-center gap-1 underline underline-offset-4"
    to={Links.DISCLAIMER()}
    target="_blank"
  >
    <span>{children}</span>
    <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
  </Link>
);
