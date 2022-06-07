import { Button, Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouteLink } from 'react-router-dom';

import { BulletHeader } from '../../components/bullet-header';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Links } from '../../config';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';
import type { Staking as StakingQueryResult } from './__generated__/Staking';
import { ConnectToVega } from './connect-to-vega';
import { NodeList } from './node-list';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { truncateMiddle } from '../../lib/truncate-middle';

export const Staking = ({ data }: { data?: StakingQueryResult }) => {
  const { t } = useTranslation();

  return (
    <>
      <section className="mb-24">
        <p className="mb-12">{t('stakingDescription1')}</p>
        <p className="mb-12">{t('stakingDescription2')}</p>
        <p className="mb-12">{t('stakingDescription3')}</p>
        <p className="mb-12">{t('stakingDescription4')}</p>
        <p className="mb-12">
          <Link href={Links.STAKING_GUIDE} target="_blank">
            {t('readMoreStaking')}
          </Link>
        </p>
      </section>

      <section>
        <BulletHeader tag="h2" style={{ marginTop: 0 }}>
          {t('stakingStep1')}
        </BulletHeader>
        <StakingStepConnectWallets />
      </section>
      <section>
        <BulletHeader tag="h2">{t('stakingStep2')}</BulletHeader>
        <StakingStepAssociate
          associated={
            new BigNumber(
              data?.party?.stake.currentStakeAvailableFormatted || '0'
            )
          }
        />
      </section>
      <section>
        <BulletHeader tag="h2">{t('stakingStep3')}</BulletHeader>
        <StakingStepSelectNode data={data} />
      </section>
    </>
  );
};

export const StakingStepConnectWallets = () => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { keypair } = useVegaWallet();
  const { appDispatch } = useAppState();

  if (keypair && account) {
    return (
      <Callout intent={Intent.Success} iconName="tick" title={'Connected'}>
        <p>
          {t('Connected Ethereum address')}&nbsp;
          <Link
            title={t('View address on Etherscan')}
            href={`${ETHERSCAN_URL}/tx/${account}`}
          >
            {account}
          </Link>
        </p>
        <p>
          {t('stakingVegaWalletConnected', {
            key: truncateMiddle(keypair.pub),
          })}
        </p>
      </Callout>
    );
  }

  return (
    <>
      <p>
        <Trans
          i18nKey="stakingStep1Text"
          components={{
            vegaWalletLink: (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <Link href={Links.WALLET_GUIDE} target="_blank" />
            ),
          }}
        />
      </p>
      {account ? (
        <div className="mb-24">
          <Callout
            iconName="tick"
            intent={Intent.Success}
            title={`Ethereum wallet connected: ${account}`}
          />
        </div>
      ) : (
        <p>
          <Button
            onClick={() =>
              appDispatch({
                type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
                isOpen: true,
              })
            }
            data-testid="connect-to-eth-btn"
          >
            {t('connectEthWallet')}
          </Button>
        </p>
      )}
      {keypair ? (
        <div className="mb-24">
          <Callout
            iconName="tick"
            intent={Intent.Success}
            title={`Vega wallet connected: ${truncateMiddle(keypair.pub)}`}
          />
        </div>
      ) : (
        <ConnectToVega />
      )}
    </>
  );
};

export const StakingStepAssociate = ({
  associated,
}: {
  associated: BigNumber;
}) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { keypair } = useVegaWallet();

  if (!account) {
    return (
      <Callout
        intent={Intent.Danger}
        iconName="error"
        title={t('stakingAssociateConnectEth')}
      />
    );
  } else if (!keypair) {
    return (
      <Callout
        intent={Intent.Danger}
        iconName="error"
        title={t('stakingAssociateConnectVega')}
      />
    );
  }
  if (associated.isGreaterThan(0)) {
    return (
      <Callout
        intent={Intent.Success}
        iconName="tick"
        title={t('stakingHasAssociated', { tokens: formatNumber(associated) })}
      >
        <p>
          <RouteLink to="/staking/associate">
            <Button data-testid="associate-more-tokens-btn">
              {t('stakingAssociateMoreButton')}
            </Button>
          </RouteLink>
        </p>
        <RouteLink to="/staking/disassociate">
          <Button data-testid="disassociate-tokens-btn">
            {t('stakingDisassociateButton')}
          </Button>
        </RouteLink>
      </Callout>
    );
  }

  return (
    <>
      <p>{t('stakingStep2Text')}</p>
      <RouteLink to="/staking/associate">
        <Button data-testid="associate-tokens-btn">
          {t('associateButton')}
        </Button>
      </RouteLink>
    </>
  );
};

export const StakingStepSelectNode = ({
  data,
}: {
  data?: StakingQueryResult;
}) => {
  return <NodeList epoch={data?.epoch} party={data?.party} />;
};
