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
import { useContext, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ThemeContext } from '@vegaprotocol/react-helpers';
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
import { t } from '@vegaprotocol/react-helpers';

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
  const theme = useContext(ThemeContext);

  const [interval, setInterval] = useState<Interval>(Interval.I15M);
  const [chartType, setChartType] = useState<ChartType>(ChartType.CANDLE);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex flex-row flex-wrap gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            {t(`Interval: ${intervalLabels[interval]}`)}
          </DropdownMenuTrigger>
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
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Icon name={chartTypeIcon.get(chartType) as IconName} />
          </DropdownMenuTrigger>
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
        <DropdownMenu>
          <DropdownMenuTrigger>{t('Overlays')}</DropdownMenuTrigger>
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
        <DropdownMenu>
          <DropdownMenuTrigger>{t('Studies')}</DropdownMenuTrigger>
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
