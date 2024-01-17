import { useEffect, useRef } from 'react';
import {
  useScreenDimensions,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import { useLanguage } from './use-t';
import { useDatafeed } from './use-datafeed';
import { type ResolutionString } from './constants';

export type OnAutoSaveNeededCallback = (data: { studies: string[] }) => void;

export const TradingView = ({
  marketId,
  libraryPath,
  interval,
  studies,
  onIntervalChange,
  onAutoSaveNeeded,
}: {
  marketId: string;
  libraryPath: string;
  interval: ResolutionString;
  studies: string[];
  onIntervalChange: (interval: string) => void;
  onAutoSaveNeeded: OnAutoSaveNeededCallback;
}) => {
  const { isMobile } = useScreenDimensions();
  const { theme } = useThemeSwitcher();
  const language = useLanguage();
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  // Cant get types as charting_library is externally loaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>();

  const datafeed = useDatafeed();

  useEffect(
    () => {
      const disableOnSmallScreens = isMobile ? ['left_toolbar'] : [];

      const overrides = getOverrides(theme);

      const widgetOptions = {
        symbol: marketId,
        datafeed,
        interval: interval,
        container: chartContainerRef.current,
        library_path: libraryPath,
        custom_css_url: 'vega_styles.css',
        // Trading view accepts just 'en' rather than 'en-US' which is what react-i18next provides
        // https://www.tradingview.com/charting-library-docs/latest/core_concepts/Localization?_highlight=language#supported-languages
        locale: language.split('-')[0],
        enabled_features: ['tick_resolution'],
        disabled_features: [
          'header_symbol_search',
          'header_compare',
          'show_object_tree',
          'timeframes_toolbar',
          ...disableOnSmallScreens,
        ],
        fullscreen: false,
        autosize: true,
        theme,
        overrides,
        loading_screen: {
          backgroundColor: overrides['paneProperties.background'],
        },
      };

      // @ts-ignore parent component loads TradingView onto window obj
      widgetRef.current = new window.TradingView.widget(widgetOptions);

      widgetRef.current.onChartReady(() => {
        widgetRef.current.applyOverrides(getOverrides(theme));

        widgetRef.current.subscribe('onAutoSaveNeeded', () => {
          const studies = widgetRef.current
            .activeChart()
            .getAllStudies()
            .map((s: { id: string; name: string }) => s.name);
          onAutoSaveNeeded({ studies });
        });

        const activeChart = widgetRef.current.activeChart();

        // Show volume study by default, second bool arg adds it as a overlay on top of the chart
        studies.forEach((study) => {
          activeChart.createStudy(study);
        });

        // Subscribe to interval changes so it can be persisted in chart settings
        activeChart.onIntervalChanged().subscribe(null, onIntervalChange);
      });

      return () => {
        if (!widgetRef.current) return;
        widgetRef.current.remove();
      };
    },

    // No theme in deps to avoid full chart reload when the theme changes
    // Instead the theme is changed programmatically in a separate useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datafeed, marketId, language, libraryPath, isMobile]
  );

  // Update the trading view theme every time the app theme updates, done separately
  // to avoid full chart reload
  useEffect(() => {
    if (!widgetRef.current || !widgetRef.current._ready) return;

    // Calling changeTheme will reset the default dark/light background to the TV default
    // so we need to re-apply the pane bg override. A promise is also required
    // https://github.com/tradingview/charting_library/issues/6546#issuecomment-1139517908
    widgetRef.current.changeTheme(theme).then(() => {
      widgetRef.current.applyOverrides(getOverrides(theme));
    });
  }, [theme]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

const getOverrides = (theme: 'dark' | 'light') => {
  return {
    // colors set here, trading view lets the user set a color
    'paneProperties.background': theme === 'dark' ? '#05060C' : '#fff',
    'paneProperties.backgroundType': 'solid',
    // hide market name within TV chart as its already above
    'paneProperties.legendProperties.showSeriesTitle': false,
  };
};
