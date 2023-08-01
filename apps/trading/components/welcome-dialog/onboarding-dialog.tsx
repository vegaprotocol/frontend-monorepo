import { t } from '@vegaprotocol/i18n';
import { GetStarted } from './get-started';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../constants';
import { useEnvironment } from '@vegaprotocol/environment';

export const OnboardingDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const [, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );
  const navigate = useNavigate();
  const browseMarkets = () => {
    const link = Links[Routes.MARKETS]();
    navigate(link);
    setOnboardingViewed('true');
  };
  const lead =
    VEGA_ENV === 'MAINNET'
      ? t('Start trading on the worlds most advanced decentralised exchange.')
      : t(
          'Free from the risks of real trading, Fairground is a safe and fun place to try out Vega yourself with virtual assets.'
        );
  return (
    <div className="flex flex-col py-2">
      <div className="flex gap-8">
        <div className="w-1/2 flex flex-col justify-between pt-8">
          <ul className="-ml-3">
            <li className="my-3 flex gap-3">
              <div className="rounded-full w-[48px] h-[48px] bg-vega-dark-400 dark:bg-vega-dark-200 shrink-0"></div>
              <div>
                <h3 className="text-lg text-vega-clight-50 dark:text-vega-cdark-50">
                  {t('Trade with no KYC')}
                </h3>
                <span className="text-sm text-vega-clight-100 dark:text-vega-cdark-100 leading-4">
                  {t(
                    'Pseudonomously trade Futures markets. Spot and perps comming soon'
                  )}
                </span>
              </div>
            </li>
            <li className="my-3 flex gap-3">
              <div className="rounded-full w-[48px] h-[48px] bg-vega-dark-400 dark:bg-vega-dark-200 shrink-0"></div>
              <div>
                <h3 className="text-lg text-vega-clight-50 dark:text-vega-cdark-50 font-">
                  {t('Community generated trading pairs')}
                </h3>
                <span className="text-sm text-vega-clight-100 dark:text-vega-cdark-100 leading-4">
                  {t('All markets are proposed and enacted by the community')}
                </span>
              </div>
            </li>
            <li className="my-3 flex gap-3">
              <div className="rounded-full w-[48px] h-[48px] bg-vega-dark-400 dark:bg-vega-dark-200 shrink-0"></div>
              <div>
                <h3 className="text-lg text-vega-clight-50 dark:text-vega-cdark-50 font-">
                  {t('Rewards')}
                </h3>
                <span className="text-sm text-vega-clight-100 dark:text-vega-cdark-100 leading-4">
                  {t(
                    'Earn rewards for trading, market making and providing liquidity'
                  )}
                </span>
              </div>
            </li>
          </ul>
          <TradingButton
            onClick={browseMarkets}
            className="block w-full"
            data-testid="browse-markets-button"
          >
            {t('Browse the markets')}
          </TradingButton>
        </div>
        <div className="w-1/2 -mr-3 flex flex-grow">
          <GetStarted lead={lead} />
        </div>
      </div>
    </div>
  );
};
