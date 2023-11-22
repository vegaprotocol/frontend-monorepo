import { useEffect, useRef } from 'react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import {
  type ChartingLibraryWidgetOptions,
  type LanguageCode,
  type ResolutionString,
  widget,
} from '../charting_library';
import { useDataFeed } from './datafeed';

export const TradingView = ({ marketId }: { marketId: string }) => {
  const { theme } = useThemeSwitcher();
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const datafeed = useDataFeed(marketId);

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: marketId,
      // BEWARE: no trailing slash is expected in feed URL
      // eslint-disable-next-line

      datafeed,
      interval: '1' as ResolutionString,
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      locale: 'en' as LanguageCode,
      disabled_features: [
        'use_localstorage_for_settings',
        'header_symbol_search',
        'header_compare',
      ],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      theme,
    };

    const tvWidget = new widget(widgetOptions);

    // Add a custom button
    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute('title', 'Click to show a notification popup');
        button.classList.add('apply-common-tooltip');
        button.addEventListener('click', () =>
          tvWidget.showNoticeDialog({
            title: 'Notification',
            body: 'TradingView Charting Library API works correctly',
            callback: () => {
              console.log('Noticed!');
            },
          }),
        );

        button.innerHTML = 'Check API';
      });
    });

    return () => {
      tvWidget.remove();
    };
  }, [theme, datafeed, marketId]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
