import {
  Button,
  Popover,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import {
  getProductType,
  useMarketList,
  useMarketWithData,
} from '@vegaprotocol/markets';
import { useState } from 'react';
import { MarketHeaderSwitch } from './market-header-switch';
import { Emblem } from '@vegaprotocol/emblem';
import {
  MarketIcon,
  getMarketStateTooltip,
} from '../../client-pages/markets/market-icon';
import { useT } from '../../lib/use-t';
import { MarketProductPill } from '@vegaprotocol/datagrid';
import { MarketBannerIndicator } from '../market-banner/market-banner';
import { useShareDialogStore } from '../share-dialog';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarketWithData(marketId);
  const [open, setOpen] = useState(false);
  const t = useT();

  // Ensure that markets are kept cached so opening the list
  // shows all markets instantly
  useMarketList();

  const setShareDialogOpen = useShareDialogStore((state) => state.setOpen);

  if (!data) return null;

  const tooltip = getMarketStateTooltip(
    data.data.marketState,
    data.data.marketTradingMode
  );

  return (
    <Header
      title={
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={
            <HeaderTitle>
              <Tooltip description={t(tooltip)}>
                <span className="flex items-center gap-1">
                  <Emblem market={data.id} size={26} className="mr-1" />
                  {data.tradableInstrument.instrument.code}
                  <MarketProductPill productType={getProductType(data)} />
                  <MarketIcon data={data} />
                </span>
              </Tooltip>
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
            </HeaderTitle>
          }
          alignOffset={-10}
          sideOffset={12}
        >
          <MarketSelector
            currentMarketId={marketId}
            onSelect={() => setOpen(false)}
            className="md:w-[680px]"
          />
        </Popover>
      }
    >
      <MarketHeaderSwitch market={data} />
      <div className="flex w-full justify-end">
        <MarketBannerIndicator market={data} kind={'ActiveReward'} />
      </div>
      <Button
        className="flex gap-1 h-8 px-2"
        onClick={() => {
          setShareDialogOpen(true);
        }}
      >
        <span>{t('SHARE_BUTTON')}</span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
      </Button>
    </Header>
  );
};
