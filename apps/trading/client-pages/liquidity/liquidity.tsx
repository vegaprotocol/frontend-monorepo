import { matchFilter, lpAggregatedDataProvider } from '@vegaprotocol/liquidity';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { Tab, Tabs } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LiquidityContainer } from '../../components/liquidity-container';

const enum LiquidityTabs {
  Active = 'active',
  Inactive = 'inactive',
  MyLiquidityProvision = 'myLP',
}

export const Liquidity = () => {
  const params = useParams();
  const marketId = params.marketId;
  return <LiquidityViewContainer marketId={marketId} />;
};

export const LiquidityViewContainer = ({
  marketId,
}: {
  marketId: string | undefined;
}) => {
  const [tab, setTab] = useState<string | undefined>(undefined);
  const { pubKey } = useVegaWallet();

  const { data } = useDataProvider({
    dataProvider: lpAggregatedDataProvider,
    skipUpdates: true,
    variables: { marketId: marketId || '' },
    skip: !marketId,
  });

  useEffect(() => {
    if (data) {
      if (pubKey && data.some((lp) => matchFilter({ partyId: pubKey }, lp))) {
        setTab(LiquidityTabs.MyLiquidityProvision);
        return;
      }
      if (data.some((lp) => matchFilter({ active: true }, lp))) {
        setTab(LiquidityTabs.Active);
        return;
      }
      setTab(LiquidityTabs.Inactive);
    }
  }, [data, pubKey]);

  return (
    <div className="h-full p-1.5">
      <div className="h-full border border-default">
        <Tabs value={tab || LiquidityTabs.Active} onValueChange={setTab}>
          <Tab
            id={LiquidityTabs.MyLiquidityProvision}
            name={t('My liquidity provision')}
            hidden={!pubKey}
          >
            <LiquidityContainer
              marketId={marketId}
              filter={{ partyId: pubKey || undefined }}
            />
          </Tab>
          <Tab id={LiquidityTabs.Active} name={t('Active')}>
            <LiquidityContainer marketId={marketId} filter={{ active: true }} />
          </Tab>
          <Tab id={LiquidityTabs.Inactive} name={t('Inactive')}>
            <LiquidityContainer
              marketId={marketId}
              filter={{ active: false }}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};
