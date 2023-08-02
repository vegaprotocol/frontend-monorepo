import 'pennant/dist/style.css';
import {
  ChartType,
  Interval,
  Overlay,
  Study,
  chartTypeLabels,
  intervalLabels,
  overlayLabels,
  studyLabels,
} from 'pennant';
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
import { useCandlesChartSettings } from './use-candles-chart-settings';

const chartTypeIcon = new Map<ChartType, IconName>([
  [ChartType.AREA, IconNames.TIMELINE_AREA_CHART],
  [ChartType.CANDLE, IconNames.WATERFALL_CHART],
  [ChartType.LINE, IconNames.TIMELINE_LINE_CHART],
  [ChartType.OHLC, IconNames.WATERFALL_CHART],
]);

export const CandlesMenu = () => {
  const {
    interval,
    chartType,
    studies,
    overlays,
    setInterval,
    setType,
    setStudies,
    setOverlays,
  } = useCandlesChartSettings();
  const triggerClasses = 'text-xs';
  const contentAlign = 'end';

  return (
    <>
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger className={triggerClasses}>
            {t(`Interval: ${intervalLabels[interval]}`)}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent align={contentAlign}>
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
          <DropdownMenuTrigger className={triggerClasses}>
            <Icon name={chartTypeIcon.get(chartType) as IconName} />
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent align={contentAlign}>
          <DropdownMenuRadioGroup
            value={chartType}
            onValueChange={(value) => {
              setType(value as ChartType);
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
        trigger={
          <DropdownMenuTrigger className={triggerClasses}>
            {t('Overlays')}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent align={contentAlign}>
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
        trigger={
          <DropdownMenuTrigger className={triggerClasses}>
            {t('Studies')}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent align={contentAlign}>
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
    </>
  );
};
