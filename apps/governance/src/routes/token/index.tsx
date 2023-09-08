import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Heading, SubHeading } from '../../components/heading';
import { ExternalLinks } from '@vegaprotocol/environment';
import { toBigNum } from '@vegaprotocol/utils';
import { useAppState } from '../../contexts/app-state/app-state-context';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import Routes from '../routes';
import { TokenDetails } from './token-details';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useNodeDataQuery } from './__generated__/NodeData';

const Home = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { appState } = useAppState();
  const { data } = useNodeDataQuery();
  const totalAssociated = React.useMemo(() => {
    return toBigNum(data?.nodeData?.stakedTotal || '0', appState.decimals);
  }, [appState.decimals, data?.nodeData?.stakedTotal]);

  return (
    <>
      <Heading title={t('pageTitleHome')} />
      <HomeSection>
        <TokenDetails
          totalSupply={appState.totalSupply}
          totalAssociated={totalAssociated}
        />
      </HomeSection>
      <HomeSection>
        <SubHeading title={t('Token Vesting')} />
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
                  to={Routes.SUPPLY}
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
        <Link to={Routes.REDEEM}>
          <Button
            variant="primary"
            size="md"
            data-testid="check-vesting-page-btn"
          >
            {t('Check to see if you can redeem unlocked VEGA tokens')}
          </Button>
        </Link>
      </HomeSection>
      <HomeSection>
        <SubHeading title={t('Use your Vega tokens')} />
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
            href={ExternalLinks.VEGA_WALLET_URL}
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
            to={Routes.ASSOCIATE}
            className="underline text-white"
          >
            {t('Associate VEGA tokens')}
          </Link>
        </p>
      </HomeSection>
      <div className="flex justify-between flex-wrap gap-x-12 gap-y-4">
        <div className="flex-1 min-w-[360px]">
          <HomeSection>
            <SubHeading title={t('Staking')} />
            <p>
              {t(
                'VEGA token holders can nominate a validator node and receive staking rewards.'
              )}
            </p>
            <p>
              <Link to={Routes.VALIDATORS}>
                <Button size="md" data-testid="staking-button-on-homepage">
                  {t('Nominate a validator')}
                </Button>
              </Link>
            </p>
          </HomeSection>
        </div>
        <div className="flex-1 min-w-[360px]">
          <HomeSection>
            <SubHeading title={t('Governance')} />
            <p>
              {t(
                'VEGA token holders can vote on proposed changes to the network and create proposals.'
              )}
            </p>
            <p>
              <Link to={Routes.PROPOSALS}>
                <Button size="md" data-testid="governance-button-on-homepage">
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
  return <section className="mb-12">{children}</section>;
};
