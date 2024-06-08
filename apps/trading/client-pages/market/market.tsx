import { useEffect } from 'react';
import { addDecimalsFormatNumber, titlefy } from '@vegaprotocol/utils';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { Link, Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { TradeGrid } from './trade-grid';
import { TradePanels } from './trade-panels';
import { useNavigate, useParams } from 'react-router-dom';
import { Links } from '../../lib/links';
import { useT, ns } from '../../lib/use-t';
import {
  useMarket,
  getAsset,
  getBaseAsset,
  isSpot,
} from '../../lib/hooks/use-markets';
import { Trans } from 'react-i18next';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

const TitleUpdater = ({
  price,
  marketName,
  decimalPlaces,
}: {
  price?: string;
  marketName?: string;
  decimalPlaces?: number;
}) => {
  const pageTitle = usePageTitleStore((store) => store.pageTitle);
  const updateTitle = usePageTitleStore((store) => store.updateTitle);

  useEffect(() => {
    const marketPrice = calculatePrice(price, decimalPlaces);
    if (marketName) {
      const newPageTitle = titlefy([marketName, marketPrice]);
      if (pageTitle !== newPageTitle) {
        updateTitle(newPageTitle);
      }
    }
  }, [decimalPlaces, marketName, price, pageTitle, updateTitle]);

  return null;
};

export const MarketPage = () => {
  const t = useT();
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);
  const update = useGlobalStore((store) => store.update);
  const lastMarketId = useGlobalStore((store) => store.marketId);

  const { data, isLoading } = useMarket({ marketId });

  useEffect(() => {
    if (data?.id && data.id !== lastMarketId) {
      update({ marketId: data.id });
    }
  }, [update, lastMarketId, data?.id]);

  if (isLoading) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!data) {
    return (
      <Splash>
        <span className="flex flex-col items-center gap-2">
          <p className="justify-center text-sm">
            {t('This market URL is not available any more.')}
          </p>
          <p className="justify-center text-sm">
            <Trans
              defaults="Please choose another market from the <0>market list</0>"
              ns={ns}
              components={[
                <Link
                  className="underline underline-offset-4 "
                  onClick={() => navigate(Links.MARKETS())}
                  key="link"
                >
                  market list
                </Link>,
              ]}
            />
          </p>
        </span>
      </Splash>
    );
  }

  const pinnedAssets =
    data && isSpot(data.tradableInstrument.instrument.product)
      ? [getAsset(data), getBaseAsset(data)]
      : [getAsset(data)];

  return (
    <>
      <TitleUpdater
        price={data.data?.markPrice}
        marketName={data?.tradableInstrument.instrument.name}
        decimalPlaces={data?.decimalPlaces}
      />
      {largeScreen ? (
        <TradeGrid market={data} pinnedAssets={pinnedAssets} />
      ) : (
        <TradePanels market={data} pinnedAssets={pinnedAssets} />
      )}
    </>
  );
};
