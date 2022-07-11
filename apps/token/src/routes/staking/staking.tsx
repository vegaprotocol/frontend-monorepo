import { Button, Callout, Intent, Link } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouteLink } from 'react-router-dom';
import { useEnvironment } from '@vegaprotocol/environment';
import { Links } from '../../config';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { formatNumber } from '../../lib/format-number';
import { ConnectToVega } from './connect-to-vega';
import { NodeList } from './node-list';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { truncateMiddle } from '../../lib/truncate-middle';
import type { BigNumber } from '../../lib/bignumber';
import type { Staking as StakingQueryResult } from './__generated__/Staking';

export const Staking = ({ data }: { data?: StakingQueryResult }) => {
  const { t } = useTranslation();

  return (
    <>
      <section data-testid="staking-description" className="mb-24">
        <Callout
          intent={Intent.Primary}
          iconName="help"
          title={t('stakingDescriptionTitle')}
        >
          <ol className="mb-20">
            <li>{t('stakingDescription1')}</li>
            <li>{t('stakingDescription2')}</li>
            <li>{t('stakingDescription3')}</li>
            <li>{t('stakingDescription4')}</li>
          </ol>

          <Link
            href={Links.STAKING_GUIDE}
            target="_blank"
            data-testid="staking-guide-link"
          >
            <Button variant="secondary">{t('readMoreStaking')}</Button>
          </Link>
        </Callout>
      </section>

      <section>
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
            title={t('View on Etherscan (opens in a new tab)')}
            href={`${ETHERSCAN_URL}/tx/${account}`}
            target="_blank"
          >
            {truncateMiddle(account)}
          </Link>
        </p>
        <p className="mb-8">
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
              <Link
                href={Links.WALLET_GUIDE}
                className="text-white underline"
                target="_blank"
              />
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
        <div className="flex flex-wrap gap-4">
          <RouteLink to="associate">
            <Button data-testid="associate-more-tokens-btn">
              {t('stakingAssociateMoreButton')}
            </Button>
          </RouteLink>
          <RouteLink to="disassociate">
            <Button data-testid="disassociate-tokens-btn">
              {t('stakingDisassociateButton')}
            </Button>
          </RouteLink>
        </div>
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
  return (
    <NodeList data-testid="node-list" epoch={data?.epoch} party={data?.party} />
  );
};
