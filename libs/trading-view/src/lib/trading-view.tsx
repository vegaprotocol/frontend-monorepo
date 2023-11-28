import { useEffect, useRef } from 'react';
import { useScript, useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
/**
 * TODO: figure out how to import types
import {
  type ChartingLibraryWidgetOptions,
  type LanguageCode,
  type ResolutionString,
  widget,
} from '../charting_library';
*/
import { useLanguage, useT } from './use-t';
import { useDatafeed } from './use-datafeed';

export const TradingViewContainer = ({
  marketId,
  libraryPath,
  libraryHash,
}: {
  marketId: string;
  libraryPath: string;
  libraryHash: string;
}) => {
  const t = useT();
  const scriptState = useScript(
    libraryPath + 'charting_library.standalone.js',
    libraryHash
  );

  if (scriptState === 'pending') return null;

  if (scriptState === 'error') {
    return (
      <Splash>
        <p>{t('Failed to initialize Trading view')}</p>
      </Splash>
    );
  }

  return <TradingView marketId={marketId} libraryPath={libraryPath} />;
};

export const TradingView = ({
  marketId,
  libraryPath,
}: {
  marketId: string;
  libraryPath: string;
}) => {
  const { theme } = useThemeSwitcher();
  const language = useLanguage();
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const datafeed = useDatafeed();

  useEffect(() => {
    // @ts-ignore cant import types as chartin_library is external
    // eslint-disable-next-line
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: marketId,
      // BEWARE: no trailing slash is expected in feed URL
      // eslint-disable-next-line

      datafeed,
      // @ts-ignore cant import types as chartin_library is external
      interval: '1' as ResolutionString,
      container: chartContainerRef.current,
      library_path: libraryPath,
      custom_css_url: 'vega_styles.css',
      // @ts-ignore cant import types as chartin_library is external
      locale: language as LanguageCode,
      disabled_features: [
        'use_localstorage_for_settings',
        'header_symbol_search',
        'header_compare',
      ],
      enabled_features: ['study_templates'],
      // TODO: remove
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      // TODO: remove
      client_id: 'tradingview.com',
      // TODO: remove
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
  }, [theme, datafeed, marketId, libraryPath]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
