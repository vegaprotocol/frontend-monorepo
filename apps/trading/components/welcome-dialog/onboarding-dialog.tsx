import { t } from '@vegaprotocol/i18n';
import { GetStarted } from './get-started';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../constants';
import { Networks, useEnvironment } from '@vegaprotocol/environment';

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
    VEGA_ENV === Networks.MAINNET
      ? t('Start trading on the worlds most advanced decentralised exchange.')
      : t(
          'Free from the risks of real trading, Fairground is a safe and fun place to try out Vega yourself with virtual assets.'
        );
  return (
    <div className="flex flex-col pb-2">
      <div className="flex gap-8">
        <div className="w-1/2 flex flex-col justify-between pt-3">
          <ul className="ml-0">
            <li className="my-3 flex gap-3 text-default">
              <div className="shrink-0 pt-1.5">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 30 30"
                  fill="currentColor"
                >
                  <rect x="14" y="20" width="2" height="2" />
                  <rect x="12" y="18" width="2" height="2" />
                  <rect x="10" y="8" width="2" height="10" />
                  <rect x="16" y="18" width="2" height="2" />
                  <rect x="20" y="16" width="2" height="2" />
                  <rect x="18" y="8" width="2" height="8" />
                  <rect x="28" y="2" width="2" height="26" />
                  <rect y="2" width="2" height="26" />
                  <rect
                    x="28"
                    width="2"
                    height="26"
                    transform="rotate(90 28 0)"
                  />
                  <rect
                    x="28"
                    y="28"
                    width="2"
                    height="26"
                    transform="rotate(90 28 28)"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg">{t('Trade with no KYC')}</h3>
                <span className="text-sm text-vega-clight-100 dark:text-vega-cdark-100 leading-4">
                  {t(
                    'Pseudonomously trade Futures markets. Spot and perps comming soon'
                  )}
                </span>
              </div>
            </li>
            <li className="my-3 flex gap-3 text-vega-clight-50 dark:text-vega-cdark-50">
              <div className="shrink-0 pt-1.5">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 30 30"
                  fill="currentColor"
                >
                  <g clip-path="url(#clip0_5168_49089)">
                    <path d="M22 7H18V9H22V7Z" />
                    <path d="M22 13H18V15H22V13Z" />
                    <path d="M24 17H16V19H24V17Z" />
                    <path d="M24 9H22V13H24V9Z" />
                    <path d="M18 9H16V13H18V9Z" />
                    <path d="M6 19H4V23H6V19Z" />
                    <path d="M16 19H14V23H16V19Z" />
                    <path d="M26 19H24V23H26V19Z" />
                    <path d="M12 7H8V9H12V7Z" />
                    <path d="M12 13H8V15H12V13Z" />
                    <path d="M14 17H6V19H14V17Z" />
                    <path d="M14 9H12V13H14V9Z" />
                    <path d="M8 9H6V13H8V9Z" />
                    <path d="M30 2H28V28H30V2Z" />
                    <path d="M2 2H0V28H2V2Z" />
                    <path d="M28 0H2V2H28V0Z" />
                    <path d="M28 28H2V30H28V28Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_5168_49089">
                      <rect width="30" height="30" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div>
                <h3 className="text-lg">
                  {t('Community generated trading pairs')}
                </h3>
                <span className="text-sm text-vega-clight-100 dark:text-vega-cdark-100 leading-4">
                  {t('All markets are proposed and enacted by the community')}
                </span>
              </div>
            </li>
            <li className="my-3 flex gap-3 text-vega-clight-50 dark:text-vega-cdark-50">
              <div className="shrink-0 pt-1.5">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 30 30"
                  fill="currentColor"
                >
                  <rect x="6" y="16" width="4" height="2" />
                  <rect x="10" y="14" width="2" height="2" />
                  <rect
                    x="12"
                    y="24"
                    width="4"
                    height="2"
                    transform="rotate(-90 12 24)"
                  />
                  <rect
                    x="10"
                    y="20"
                    width="2"
                    height="2"
                    transform="rotate(-90 10 20)"
                  />
                  <rect
                    x="20"
                    y="18"
                    width="4"
                    height="2"
                    transform="rotate(-180 20 18)"
                  />
                  <rect
                    x="16"
                    y="20"
                    width="2"
                    height="2"
                    transform="rotate(-180 16 20)"
                  />
                  <rect
                    x="16"
                    y="14"
                    width="2"
                    height="2"
                    transform="rotate(90 16 14)"
                  />
                  <rect
                    x="22"
                    y="10"
                    width="2"
                    height="2"
                    transform="rotate(90 22 10)"
                  />
                  <rect
                    x="20"
                    y="8"
                    width="2"
                    height="2"
                    transform="rotate(90 20 8)"
                  />
                  <rect
                    x="24"
                    y="8"
                    width="2"
                    height="2"
                    transform="rotate(90 24 8)"
                  />
                  <rect
                    x="22"
                    y="6"
                    width="2"
                    height="2"
                    transform="rotate(90 22 6)"
                  />
                  <rect x="12" y="10" width="2" height="4" />
                  <rect x="28" y="2" width="2" height="26" />
                  <rect y="2" width="2" height="26" />
                  <rect
                    x="28"
                    width="2"
                    height="26"
                    transform="rotate(90 28 0)"
                  />
                  <rect
                    x="28"
                    y="28"
                    width="2"
                    height="26"
                    transform="rotate(90 28 28)"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg">{t('Rewards')}</h3>
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
