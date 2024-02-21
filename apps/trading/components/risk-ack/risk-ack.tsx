import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import {
  TradingButton as Button,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { useOnboardingStore } from '../welcome-dialog/use-get-onboarding-step';
import { Links } from '../../lib/links';

export const RiskAck = () => {
  const t = useT();
  const accept = useOnboardingStore((store) => store.acceptRisk);
  const reject = useOnboardingStore((store) => store.rejectRisk);

  return (
    <>
      <div className="p-6 mb-6 bg-vega-light-100 dark:bg-vega-dark-100">
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
      <p className="mb-8">
        <Trans
          defaults="By using the Vega Console, you acknowledge that you have read and understood the <0>Vega Console Disclaimer</0>"
          components={[<DisclaimerLink key="link" onClick={() => {}} />]}
        />
      </p>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Button onClick={reject} fill>
            {t('Cancel')}
          </Button>
        </div>
        <div>
          <Button onClick={accept} intent={Intent.Info} fill>
            {t('I agree')}
          </Button>
        </div>
      </div>
    </>
  );
};

const DisclaimerLink = ({
  children,
  onClick,
}: {
  children?: string[];
  onClick: () => void;
}) => (
  <Link to={Links.DISCLAIMER()} target="_blank" onClick={onClick}>
    <span className="inline-flex items-center gap-1 underline underline-offset-4">
      <span>{children}</span>
      <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
    </span>
  </Link>
);
