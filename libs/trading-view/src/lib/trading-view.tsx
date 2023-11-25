import { useEffect, useRef, useState } from 'react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
/**
 * TODO: figure out how to import types
import {
  type ChartingLibraryWidgetOptions,
  type LanguageCode,
  type ResolutionString,
  widget,
} from '../charting_library';
*/
import { useDatafeed } from './use-datafeed';

const LIBRARY_PATH =
  'http://localhost:8080/charting_library/charting_library.standalone.js';

export const useScript = (url: string) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTradingViewLib = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;

        script.async = true;

        script.onload = () => resolve(script);

        script.onerror = () =>
          reject(new Error(`failed to load script: ${url}`));

        document.body.appendChild(script);
      });
    };

    loadTradingViewLib()
      .then(() => {
        setLoaded(true);
      })
      .catch((err) => console.error(err));
  }, [url]);

  return loaded;
};

export const TradingView = ({ marketId }: { marketId: string }) => {
  const loaded = useScript(LIBRARY_PATH);

  if (!loaded) return null;

  return <TradingViewChart marketId={marketId} />;
};

export const TradingViewChart = ({ marketId }: { marketId: string }) => {
  const { theme } = useThemeSwitcher();
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const datafeed = useDatafeed();

  useEffect(() => {
    // @ts-ignore cant improt types as chartin_library is external
    // eslint-disable-next-line
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: marketId,
      // BEWARE: no trailing slash is expected in feed URL
      // eslint-disable-next-line

      datafeed,
      // @ts-ignore cant improt types as chartin_library is external
      interval: '1' as ResolutionString,
      container: chartContainerRef.current,
      library_path: 'http://localhost:8080/charting_library/',
      custom_css_url: '/trading-view-styles.css',
      // @ts-ignore cant improt types as chartin_library is external
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
      overrides: {
        // colors set here, trading view lets the user set a color
        'paneProperties.background': theme === 'dark' ? '#05060C' : '#fff',
        'paneProperties.backgroundType': 'solid',
      },
    };

    // @ts-ignore parent component loads TradingView onto window obj
    const tvWidget = new window.TradingView.widget(widgetOptions);

    return () => {
      tvWidget.remove();
    };
  }, [theme, datafeed, marketId]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
