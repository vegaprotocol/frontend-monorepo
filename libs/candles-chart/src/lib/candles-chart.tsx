import 'pennant/dist/style.css';
import {
  Chart,
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
  useLocalStorageSnapshot,
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

const chartTypeIcon = new Map<ChartType, IconName>([
  [ChartType.AREA, IconNames.TIMELINE_AREA_CHART],
  [ChartType.CANDLE, IconNames.WATERFALL_CHART],
  [ChartType.LINE, IconNames.TIMELINE_LINE_CHART],
  [ChartType.OHLC, IconNames.WATERFALL_CHART],
]);

const getValidItem = <T,>(
  value: T | null | undefined,
  set: T[],
  defaultValue: T
) =>
  value !== null && value !== undefined && set.includes(value)
    ? value
    : defaultValue;

const getValidSubset = <T,>(
  value: T[] | null | undefined,
  set: T[],
  defaultValue: T[]
) =>
  value !== null && value !== undefined
    ? value.filter((item) => set.includes(item))
    : defaultValue;

const SET_SEPARATOR = '\t';

export type CandlesChartContainerProps = {
  marketId: string;
};

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();

  const [storedInterval, setInterval] = useLocalStorageSnapshot(
    'console-candels-chart-interval'
  );
  const [storedChartType, setChartType] = useLocalStorageSnapshot(
    'console-candels-chart-type'
  );
  const [storedOverlays, storeOverlays] = useLocalStorageSnapshot(
    'console-candels-chart-overlays'
  );
  const [storedStudies, storeStudies] = useLocalStorageSnapshot(
    'console-candels-chart-study'
  );

  const interval: Interval = getValidItem(
    storedInterval as Interval,
    Object.values(Interval),
    Interval.I15M
  );

  const chartType: ChartType = getValidItem(
    storedChartType as ChartType,
    Object.values(ChartType),
    ChartType.CANDLE
  );

  const setOverlays = (overlays: Overlay[]) =>
    storeOverlays(overlays.join(SET_SEPARATOR));

  const overlays: Overlay[] = getValidSubset(
    storedOverlays ? (storedOverlays.split(SET_SEPARATOR) as Overlay[]) : null,
    Object.values(Overlay),
    []
  );

  const setStudies = (studies: Study[]) =>
    storeStudies(studies.join(SET_SEPARATOR));

  const studies: Study[] = getValidSubset(
    storedStudies ? (storedStudies.split(SET_SEPARATOR) as Study[]) : null,
    Object.values(Study),
    [Study.VOLUME]
  );

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex flex-row flex-wrap gap-4">
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
                setInterval(value as Interval);
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
                setChartType(value as ChartType);
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

                  setOverlays(newOverlays);
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

                  setStudies(newStudies);
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
        <Chart
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
            setOverlays(options.overlays ?? []);
            setStudies(options.studies ?? []);
          }}
        />
      </div>
    </div>
  );
};
