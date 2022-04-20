import 'pennant/dist/style.css';

import {
  Chart as TradingChart,
  ChartType,
  chartTypeLabels,
  Interval,
  Overlay,
  overlayLabels,
  Study,
  studyLabels,
} from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useContext, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import {
  Button,
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
import classNames from 'classnames';

const chartTypeIcon = new Map<ChartType, IconName>([
  [ChartType.AREA, IconNames.TIMELINE_AREA_CHART],
  [ChartType.CANDLE, IconNames.WATERFALL_CHART],
  [ChartType.LINE, IconNames.TIMELINE_LINE_CHART],
  [ChartType.OHLC, IconNames.WATERFALL_CHART],
]);

export type TradingChartContainerProps = {
  marketId: string;
};

export const TradingChartContainer = ({
  marketId,
}: TradingChartContainerProps) => {
  const client = useApolloClient();
  const { keypair } = useVegaWallet();
  const theme = useContext(ThemeContext);

  const [interval, setInterval] = useState<Interval>(Interval.I15M);
  const [chartType, setChartType] = useState<ChartType>(ChartType.CANDLE);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, keypair?.pub);
  }, [client, marketId, keypair]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row flex-wrap gap-8">
        <div>
          {Object.values(Interval).map((timeInterval) => (
            <Button
              variant="inline"
              onClick={() => {
                setInterval(timeInterval);
              }}
            >
              <span
                className={classNames({
                  'font-bold': timeInterval === interval,
                })}
              >
                {timeInterval}
              </span>
            </Button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button appendIconName="caret-down" variant="secondary">
              <Icon name={chartTypeIcon.get(chartType) as IconName} />
            </Button>
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
                  <DropdownMenuItemIndicator>
                    <Icon name="tick" />
                  </DropdownMenuItemIndicator>
                  {chartTypeLabels[type]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button appendIconName="caret-down" variant="secondary">
              Overlays
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.values(Overlay).map((overlay) => (
              <DropdownMenuCheckboxItem
                key={overlay}
                checked={overlays.includes(overlay)}
                inset
                onCheckedChange={(checked) => {
                  const newOverlays = [...overlays];

                  const index = overlays.findIndex((item) => item === overlay);

                  index !== -1
                    ? newOverlays.splice(index, 1)
                    : newOverlays.push(overlay);

                  setOverlays(newOverlays);
                }}
              >
                <DropdownMenuItemIndicator>
                  <Icon name="tick" />
                </DropdownMenuItemIndicator>
                {overlayLabels[overlay]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button appendIconName="caret-down" variant="secondary">
              Studies
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.values(Study).map((study) => (
              <DropdownMenuCheckboxItem
                key={study}
                inset
                checked={studies.includes(study)}
                onCheckedChange={(checked) => {
                  const newStudies = [...studies];

                  const index = studies.findIndex((item) => item === study);

                  index !== -1
                    ? newStudies.splice(index, 1)
                    : newStudies.push(study);

                  setStudies(newStudies);
                }}
              >
                <DropdownMenuItemIndicator>
                  <Icon name="tick" />
                </DropdownMenuItemIndicator>
                {studyLabels[study]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1">
        <TradingChart
          dataSource={dataSource}
          options={{
            chartType: chartType,
            overlays: overlays,
            studies: studies,
          }}
          interval={interval}
          theme={theme}
          onOptionsChanged={(options) => {
            setStudies(options.studies ?? []);
          }}
        />
      </div>
    </div>
  );
};
