import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import vegaWhite from '../../images/vega_white.png';
import { BigNumber } from '../../lib/bignumber';
import { truncateMiddle } from '../../lib/truncate-middle';
import { Routes } from '../../routes/router-config';
import { BulletHeader } from '../bullet-header';
import type { WalletCardAssetProps } from '../wallet-card';
import {
  WalletCard,
  WalletCardActions,
  WalletCardAsset,
  WalletCardContent,
  WalletCardHeader,
  WalletCardRow,
} from '../wallet-card';
import { DownloadWalletPrompt } from './download-wallet-prompt';
import { usePollForDelegations } from './hooks';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Button } from '@vegaprotocol/ui-toolkit';

export const VegaWallet = () => {
  const { t } = useTranslation();
  const { keypair, keypairs } = useVegaWallet();

  const child = !keypairs ? (
    <VegaWalletNotConnected />
  ) : (
    <VegaWalletConnected vegaKeys={keypairs} />
  );

  return (
    <section className="vega-wallet">
      <WalletCard dark={true}>
        <WalletCardHeader dark={true}>
          <h1 className="col-start-1 m-0">{t('vegaWallet')}</h1>
          {keypair && (
            <>
              <div className="sm:row-start-2 sm:col-start-1 sm:col-span-2 text-h6 mb-12">
                {keypair.name}
              </div>
              <span className="sm:col-start-2 place-self-end font-mono pb-2 px-4">
                {truncateMiddle(keypair.pub)}
              </span>
            </>
          )}
        </WalletCardHeader>
        <WalletCardContent>{child}</WalletCardContent>
      </WalletCard>
    </section>
  );
};

const VegaWalletNotConnected = () => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();

  return (
    <>
      <Button
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
            isOpen: true,
          })
        }
        variant="secondary"
        className="w-full"
        data-testid="connect-vega"
      >
        {t('connectVegaWalletToUseAssociated')}
      </Button>
      <DownloadWalletPrompt />
    </>
  );
};

interface VegaWalletAssetsListProps {
  accounts: WalletCardAssetProps[];
}

const VegaWalletAssetList = ({ accounts }: VegaWalletAssetsListProps) => {
  const { t } = useTranslation();
  if (!accounts.length) {
    return null;
  }
  return (
    <>
      <WalletCardHeader>
        <BulletHeader style={{ border: 'none' }} tag="h2">
          {t('assets')}
        </BulletHeader>
      </WalletCardHeader>
      {accounts.map((a, i) => (
        <WalletCardAsset key={i} {...a} dark={true} />
      ))}
    </>
  );
};

interface VegaWalletConnectedProps {
  vegaKeys: VegaKeyExtended[];
}

const VegaWalletConnected = ({ vegaKeys }: VegaWalletConnectedProps) => {
  const { t } = useTranslation();
  const {
    appDispatch,
    appState: { decimals },
  } = useAppState();
  const { delegations, currentStakeAvailable, delegatedNodes, accounts } =
    usePollForDelegations();

  const unstaked = React.useMemo(() => {
    const totalDelegated = delegations.reduce<BigNumber>(
      (acc, cur) => acc.plus(cur.amountFormatted),
      new BigNumber(0)
    );
    return BigNumber.max(currentStakeAvailable.minus(totalDelegated), 0);
  }, [currentStakeAvailable, delegations]);

  const footer = (
    <WalletCardActions>
      <Button
        variant="inline-link"
        className="mt-4"
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_MANAGE_OVERLAY,
            isOpen: true,
          })
        }
      >
        Manage
      </Button>
    </WalletCardActions>
  );

  return vegaKeys.length ? (
    <>
      <WalletCardAsset
        image={vegaWhite}
        decimals={decimals}
        name="VEGA"
        subheading={t('Associated')}
        symbol="VEGA"
        balance={currentStakeAvailable}
        dark={true}
      />
      <WalletCardRow label={t('unstaked')} value={unstaked} dark={true} />
      {delegatedNodes.length ? (
        <WalletCardRow label={t('stakedValidators')} dark={true} bold={true} />
      ) : null}
      {delegatedNodes.map((d) => (
        <div key={d.nodeId}>
          {d.currentEpochStake && d.currentEpochStake.isGreaterThan(0) && (
            <WalletCardRow
              label={`${d.name || truncateMiddle(d.nodeId)} ${
                d.hasStakePending ? `(${t('thisEpoch')})` : ''
              }`}
              link={`${Routes.STAKING}/${d.nodeId}`}
              value={d.currentEpochStake}
              dark={true}
            />
          )}
          {d.hasStakePending && (
            <WalletCardRow
              label={`${d.name || truncateMiddle(d.nodeId)} (${t(
                'nextEpoch'
              )})`}
              link={`${Routes.STAKING}/${d.nodeId}`}
              value={d.nextEpochStake}
              dark={true}
            />
          )}
        </div>
      ))}
      <WalletCardActions>
        <Link className="flex-1 pr-8" to={Routes.GOVERNANCE}>
          <Button variant={'secondary'} className="w-full">
            {t('governance')}
          </Button>
        </Link>
        <Link className="flex-1 pl-8" to={Routes.STAKING}>
          <Button variant={'secondary'} className="w-full">
            {t('staking')}
          </Button>
        </Link>
      </WalletCardActions>
      <VegaWalletAssetList accounts={accounts} />
      {footer}
    </>
  ) : (
    <WalletCardContent>{t('noKeys')}</WalletCardContent>
  );
};
