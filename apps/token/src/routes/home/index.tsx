import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { Links } from '../../config';
import { useAppState } from '../../contexts/app-state/app-state-context';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { BigNumber } from '../../lib/bignumber';
import type { RouteChildProps } from '..';
import Routes from '../routes';
import type { NodeData } from './__generated__/NodeData';
import { TokenDetails } from './token-details';
import { Button } from '@vegaprotocol/ui-toolkit';

export const TOTAL_STAKED_QUERY = gql`
  query NodeData {
    nodeData {
      stakedTotal
      stakedTotalFormatted @client
    }
  }
`;

const Home = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { appState } = useAppState();
  const { data } = useQuery<NodeData>(TOTAL_STAKED_QUERY);
  const totalStaked = React.useMemo(() => {
    return new BigNumber(data?.nodeData?.stakedTotalFormatted || '0');
  }, [data]);

  return (
    <>
      <Heading title={t('pageTitleHome')} />
      <HomeSection>
        <TokenDetails
          totalSupply={appState.totalSupply}
          totalStaked={totalStaked}
        />
      </HomeSection>
      <HomeSection>
        <h2>{t('Token Vesting')}</h2>
        <p>
          {t(
            'The vesting contract holds VEGA tokens until they have become unlocked.'
          )}
        </p>
        <p>
          <Trans
            i18nKey="Tokens are held in different <trancheLink>Tranches</trancheLink>. Each tranche has its own schedule for how the tokens are unlocked."
            components={{
              trancheLink: (
                <Link
                  data-testid="tranches-link"
                  to={Routes.TRANCHES}
                  className="underline text-white"
                />
              ),
            }}
          />
        </p>
        <p>
          {t(
            'Once unlocked they can be redeemed from the contract so that you can transfer them between wallets.'
          )}
        </p>
        <Link to={Routes.VESTING}>
          <Button variant="secondary" data-testid="check-vesting-page-btn">
            {t('Check to see if you can redeem unlocked VEGA tokens')}
          </Button>
        </Link>
      </HomeSection>
      <HomeSection>
        <h2 className="uppercase">{t('Use your Vega tokens')}</h2>
        <p>
          {t(
            'To use your tokens on the Vega network they need to be associated with a Vega wallet/key.'
          )}
        </p>
        <p>
          {t(
            'This can happen both while held in the vesting contract as well as when redeemed.'
          )}
        </p>
        <p>
          <a
            data-testid="get-vega-wallet-link"
            href={Links.WALLET_PAGE}
            className="underline text-white"
            target="_blank"
            rel="nofollow noreferrer"
          >
            {t('Get a Vega wallet')}
          </a>
        </p>
        <p>
          <Link
            data-testid="associate-vega-tokens-link-on-homepage"
            to={`${Routes.STAKING}/associate`}
            className="underline text-white"
          >
            {t('Associate VEGA tokens')}
          </Link>
        </p>
      </HomeSection>
      <div className="flex gap-40">
        <div className="flex-1">
          <HomeSection>
            <h2>{t('Staking')}</h2>
            <p>
              {t(
                'VEGA token holders can nominate a validator node and receive staking rewards.'
              )}
            </p>
            <p>
              <Link to={Routes.STAKING}>
                <Button
                  variant="secondary"
                  data-testid="staking-button-on-homepage"
                >
                  {t('Nominate a validator')}
                </Button>
              </Link>
            </p>
          </HomeSection>
        </div>
        <div className="flex-1">
          <HomeSection>
            <h2>{t('Governance')}</h2>
            <p>
              {t(
                'VEGA token holders can vote on proposed changes to the network and create proposals.'
              )}
            </p>
            <p>
              <Link to={Routes.GOVERNANCE}>
                <Button
                  variant="secondary"
                  data-testid="governance-button-on-homepage"
                >
                  {t('View Governance proposals')}
                </Button>
              </Link>
            </p>
          </HomeSection>
        </div>
      </div>
    </>
  );
};

export default Home;

export const HomeSection = ({ children }: { children: React.ReactNode }) => {
  return <section className="mb-28">{children}</section>;
};
