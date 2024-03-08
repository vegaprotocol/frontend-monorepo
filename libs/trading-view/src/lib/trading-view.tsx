import { useEffect, useRef } from 'react';
import {
  usePrevious,
  useScreenDimensions,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import { useLanguage } from './use-t';
import { useDatafeed } from './use-datafeed';
import { type ResolutionString } from './constants';
import {
  type ChartingLibraryFeatureset,
  type LanguageCode,
  type ChartingLibraryWidgetOptions,
  type IChartingLibraryWidget,
  type ChartPropertiesOverrides,
  type ResolutionString as TVResolutionString,
} from '../charting-library';

const noop = () => {};

export type OnAutoSaveNeededCallback = (data: object) => void;

export const TradingView = ({
  marketId,
  libraryPath,
  interval,
  onIntervalChange,
}: {
  marketId: string;
  libraryPath: string;
  interval: ResolutionString;
  onIntervalChange: (interval: string) => void;
}) => {
  const { isMobile } = useScreenDimensions();
  const { theme } = useThemeSwitcher();
  const language = useLanguage();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<IChartingLibraryWidget>();

  const prevMarketId = usePrevious(marketId);
  const prevTheme = usePrevious(theme);

  const datafeed = useDatafeed(marketId);

  useEffect(() => {
    // Widget already created
    if (widgetRef.current !== undefined) {
      // Update the symbol if changed
      if (marketId !== prevMarketId) {
        datafeed.setSymbol(marketId);
        widgetRef.current.setSymbol(
          marketId,
          (interval ? interval : '15') as TVResolutionString,
          noop
        );
      }

      // Update theme theme if changed
      if (theme !== prevTheme) {
        widgetRef.current.changeTheme(theme).then(() => {
          if (!widgetRef.current) return;
          widgetRef.current.applyOverrides(getOverrides(theme));
        });
      }

      return;
    }

    if (!chartContainerRef.current) {
      return;
    }

    // Create widget
    const overrides = getOverrides(theme);

    const disabledOnSmallScreens: ChartingLibraryFeatureset[] = isMobile
      ? ['left_toolbar']
      : [];
    const disabledFeatures: ChartingLibraryFeatureset[] = [
      'header_symbol_search',
      'header_compare',
      'show_object_tree',
      'timeframes_toolbar',
      ...disabledOnSmallScreens,
    ];

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: marketId,
      datafeed,
      interval: interval as TVResolutionString,
      container: chartContainerRef.current,
      library_path: libraryPath,
      custom_css_url: 'vega_styles.css',
      // Trading view accepts just 'en' rather than 'en-US' which is what react-i18next provides
      // https://www.tradingview.com/charting-library-docs/latest/core_concepts/Localization?_highlight=language#supported-languages
      locale: language.split('-')[0] as LanguageCode,
      enabled_features: ['tick_resolution'],
      disabled_features: disabledFeatures,
      fullscreen: false,
      autosize: true,
      theme,
      overrides,
      loading_screen: {
        backgroundColor: overrides['paneProperties.background'],
      },
      auto_save_delay: 1,
    };

    widgetRef.current = new window.TradingView.widget(widgetOptions);

    widgetRef.current.onChartReady(() => {
      if (!widgetRef.current) return;

      const activeChart = widgetRef.current.activeChart();
      activeChart.createStudy('Volume');

      // Subscribe to interval changes so it can be persisted in chart settings
      activeChart.onIntervalChanged().subscribe(null, onIntervalChange);
    });
  }, [
    datafeed,
    interval,
    prevTheme,
    prevMarketId,
    marketId,
    theme,
    language,
    libraryPath,
    isMobile,
    onIntervalChange,
  ]);

  useEffect(() => {
    return () => {
      if (!widgetRef.current) return;
      widgetRef.current.remove();
      widgetRef.current = undefined;
    };
  }, []);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

const getOverrides = (
  theme: 'dark' | 'light'
): Partial<ChartPropertiesOverrides> => {
  return {
    // colors set here, trading view lets the user set a color
    'paneProperties.background': theme === 'dark' ? '#05060C' : '#fff',
    'paneProperties.backgroundType': 'solid',
    // hide market name within TV chart as its already above
    'paneProperties.legendProperties.showSeriesTitle': false,
  };
};
