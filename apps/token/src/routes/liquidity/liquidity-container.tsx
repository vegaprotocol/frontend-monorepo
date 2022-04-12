import './liquidity-container.scss';

import { Button, Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useOutletContext } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';

import { EthConnectPrompt } from '../../components/eth-connect-prompt';
import { Links, REWARDS_ADDRESSES } from '../../config';
import { DexTokensSection } from './dex-table';
import type { LiquidityState } from './liquidity-reducer';

export const LiquidityContainer = () => {
  const { state } = useOutletContext<{ state: LiquidityState }>();
  const { t } = useTranslation();
  const { account } = useWeb3React();
  return (
    <section className="liquidity-container">
      <h2>{t('liquidityRewardsTitle')}</h2>
      <p>
        {t('liquidityOnsenIntro')}{' '}
        <a href={Links.SUSHI_ONSEN_MENU}>{t('liquidityOnsenLinkText')}</a>.
      </p>
      <ul>
        <li>
          <a href={Links.SUSHI_ONSEN_WHAT_IS}>
            {t('liquidityOnsenHowItWorks')}
          </a>
        </li>
        <li>
          <a href={Links.SUSHI_ONSEN_FAQ}>{t('liquidityOnsenFAQ')}</a>
        </li>
      </ul>
      <p>
        <a href={Links.SUSHI_ONSEN_MENU}>
          <Button className="fill button-secondary">
            {t('liquidityOnsenButtonText')}
          </Button>
        </a>
      </p>

      <h2>{t('liquidityRewardsTitlePrevious')}</h2>
      <Callout intent={Intent.Danger} title={t('lpEndedTitle')}>
        <p>{t('lpEndedParagraph')}</p>
      </Callout>

      {!account && <EthConnectPrompt />}
      <h2>{t('liquidityRewardsTitle')}</h2>
      {Object.entries(REWARDS_ADDRESSES).map(([name, contractAddress]) => {
        return (
          <DexTokensSection
            key={name}
            name={name}
            contractAddress={contractAddress}
            ethAddress={account || ''}
            state={state}
          />
        );
      })}
    </section>
  );
};
