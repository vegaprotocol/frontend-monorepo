import 'pennant/dist/style.css';
import {
  CandlestickChart,
  ChartType,
  Interval,
  Overlay,
  Study,
  chartTypeLabels,
  intervalLabels,
  overlayLabels,
  studyLabels,
} from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useThemeSwitcher,
  getValidItem,
  getValidSubset,
} from '@vegaprotocol/react-helpers';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import { t } from '@vegaprotocol/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StoredSettings {
  interval?: Interval;
  type?: ChartType;
  overlays?: Overlay[];
  studies?: Study[];
}

export const useCandlesChartSettings = create<
  StoredSettings & {
    merge: (settings: StoredSettings) => void;
    setType: (type: ChartType) => void;
    setInterval: (interval: Interval) => void;
    setOverlays: (overlays: Overlay[]) => void;
    setStudies: (studies: Study[]) => void;
  }
>()(
  persist(
    immer((set) => ({
      merge: (settings: StoredSettings) =>
        set((state) => {
          Object.assign(state, settings);
        }),
      setType: (type: ChartType) =>
        set((state) => {
          state.type = type;
        }),
      setInterval: (interval: Interval) =>
        set((state) => {
          state.interval = interval;
        }),
      setOverlays: (overlays: Overlay[]) =>
        set((state) => {
          state.overlays = overlays;
        }),
      setStudies: (studies: Study[]) =>
        set((state) => {
          state.studies = studies;
        }),
    })),
    {
      name: 'console-candles',
    }
  )
);

const chartTypeIcon = new Map<ChartType, IconName>([
  [ChartType.AREA, IconNames.TIMELINE_AREA_CHART],
  [ChartType.CANDLE, IconNames.WATERFALL_CHART],
  [ChartType.LINE, IconNames.TIMELINE_LINE_CHART],
  [ChartType.OHLC, IconNames.WATERFALL_CHART],
]);

export type CandlesChartContainerProps = {
  marketId: string;
};

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();

  const settings = useCandlesChartSettings();

  const interval: Interval = getValidItem(
    settings.interval,
    Object.values(Interval),
    Interval.I15M
  );

  const chartType: ChartType = getValidItem(
    settings.type,
    Object.values(ChartType),
    ChartType.CANDLE
  );

  const overlays: Overlay[] = getValidSubset(
    settings.overlays,
    Object.values(Overlay),
    []
  );

  const studies: Study[] = getValidSubset(
    settings.studies,
    Object.values(Study),
    [Study.VOLUME]
  );

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex flex-row flex-wrap gap-2">
        <DropdownMenu
          trigger={
            <DropdownMenuTrigger>
              {t(`Interval: ${intervalLabels[interval]}`)}
            </DropdownMenuTrigger>
          }
        >
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={interval}
              onValueChange={(value) => {
                settings.setInterval(value as Interval);
              }}
            >
              {Object.values(Interval).map((timeInterval) => (
                <DropdownMenuRadioItem
                  key={timeInterval}
                  inset
                  value={timeInterval}
                >
                  {intervalLabels[timeInterval]}
                  <DropdownMenuItemIndicator />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu
          trigger={
            <DropdownMenuTrigger>
              <Icon name={chartTypeIcon.get(chartType) as IconName} />
            </DropdownMenuTrigger>
          }
        >
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={chartType}
              onValueChange={(value) => {
                settings.setType(value as ChartType);
              }}
            >
              {Object.values(ChartType).map((type) => (
                <DropdownMenuRadioItem key={type} inset value={type}>
                  {chartTypeLabels[type]}
                  <DropdownMenuItemIndicator />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu
          trigger={<DropdownMenuTrigger>{t('Overlays')}</DropdownMenuTrigger>}
        >
          <DropdownMenuContent>
            {Object.values(Overlay).map((overlay) => (
              <DropdownMenuCheckboxItem
                key={overlay}
                checked={overlays.includes(overlay)}
                onCheckedChange={() => {
                  const newOverlays = [...overlays];
                  const index = overlays.findIndex((item) => item === overlay);

                  index !== -1
                    ? newOverlays.splice(index, 1)
                    : newOverlays.push(overlay);

                  settings.setOverlays(newOverlays);
                }}
              >
                {overlayLabels[overlay]}
                <DropdownMenuItemIndicator />
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu
          trigger={<DropdownMenuTrigger>{t('Studies')}</DropdownMenuTrigger>}
        >
          <DropdownMenuContent>
            {Object.values(Study).map((study) => (
              <DropdownMenuCheckboxItem
                key={study}
                checked={studies.includes(study)}
                onCheckedChange={() => {
                  const newStudies = [...studies];
                  const index = studies.findIndex((item) => item === study);

                  index !== -1
                    ? newStudies.splice(index, 1)
                    : newStudies.push(study);

                  settings.setStudies(newStudies);
                }}
              >
                {studyLabels[study]}
                <DropdownMenuItemIndicator />
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1">
        <CandlestickChart
          dataSource={dataSource}
          options={{
            chartType: chartType,
            overlays: overlays,
            studies: studies,
            notEnoughDataText: (
              <span className="text-xs text-center text-neutral-800 dark:text-neutral-200">
                {t('No data')}
              </span>
            ),
          }}
          interval={interval}
          theme={theme}
          onOptionsChanged={(options) => {
            settings.merge({
              overlays: options.overlays,
              studies: options.studies,
            });
          }}
        />
      </div>
    </div>
  );
};
