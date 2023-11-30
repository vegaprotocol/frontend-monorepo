import { useEffect, useRef } from 'react';
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
import { useLanguage } from './use-t';
import { useDatafeed } from './use-datafeed';

export const TradingView = ({
  marketId,
  libraryPath,
  interval,
  onIntervalChange,
}: {
  marketId: string;
  libraryPath: string;
  interval: string; // ResolutionString
  onIntervalChange: (interval: string) => void;
}) => {
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
      // @ts-ignore cant import types as charting_library is external
      // eslint-disable-next-line
      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: marketId,
        datafeed,
        // @ts-ignore cant import types as charting_library is external
        interval: interval as ResolutionString,
        container: chartContainerRef.current,
        library_path: libraryPath,
        custom_css_url: 'vega_styles.css',
        // @ts-ignore cant import types as charting_library is external
        locale: language as LanguageCode,
        // TODO: figure out why the 1T (tick) interval button is disabled
        // enabled_features: ['tick_resolution'],
        disabled_features: [
          'header_symbol_search',
          'header_compare',
          'show_object_tree',
          'timeframes_toolbar',
        ],
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
      widgetRef.current = new window.TradingView.widget(widgetOptions);

      widgetRef.current.onChartReady(() => {
        widgetRef.current
          .activeChart()
          .onIntervalChanged()
          .subscribe(null, (resolution: string) => {
            onIntervalChange(resolution);
          });
      });

      return () => {
        if (!widgetRef.current) return;
        widgetRef.current.remove();
      };
    },

    // No theme in deps to avoid full chart reload when the theme changes
    // Instead the theme is changed programmitcally in a separate useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datafeed, marketId, language, libraryPath]
  );

  // Update the trading view theme every time the app theme updates
  useEffect(() => {
    if (!widgetRef.current || !widgetRef.current._ready) return;
    widgetRef.current.changeTheme(theme);
  }, [theme]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
