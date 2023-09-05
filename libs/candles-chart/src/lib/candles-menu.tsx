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
  TradingButton,
  TradingDropdown,
  TradingDropdownCheckboxItem,
  TradingDropdownContent,
  TradingDropdownItemIndicator,
  TradingDropdownRadioGroup,
  TradingDropdownRadioItem,
  TradingDropdownTrigger,
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
  const triggerButtonProps = { size: 'extra-small' } as const;

  return (
    <>
      <TradingDropdown
        trigger={
          <TradingDropdownTrigger className={triggerClasses}>
            <TradingButton {...triggerButtonProps}>
              {t(`Interval: ${intervalLabels[interval]}`)}
            </TradingButton>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent align={contentAlign}>
          <TradingDropdownRadioGroup
            value={interval}
            onValueChange={(value) => {
              setInterval(value as Interval);
            }}
          >
            {Object.values(Interval).map((timeInterval) => (
              <TradingDropdownRadioItem
                key={timeInterval}
                inset
                value={timeInterval}
              >
                {intervalLabels[timeInterval]}
                <TradingDropdownItemIndicator />
              </TradingDropdownRadioItem>
            ))}
          </TradingDropdownRadioGroup>
        </TradingDropdownContent>
      </TradingDropdown>
      <TradingDropdown
        trigger={
          <TradingDropdownTrigger className={triggerClasses}>
            <TradingButton {...triggerButtonProps}>
              <Icon name={chartTypeIcon.get(chartType) as IconName} />
            </TradingButton>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent align={contentAlign}>
          <TradingDropdownRadioGroup
            value={chartType}
            onValueChange={(value) => {
              setType(value as ChartType);
            }}
          >
            {Object.values(ChartType).map((type) => (
              <TradingDropdownRadioItem key={type} inset value={type}>
                {chartTypeLabels[type]}
                <TradingDropdownItemIndicator />
              </TradingDropdownRadioItem>
            ))}
          </TradingDropdownRadioGroup>
        </TradingDropdownContent>
      </TradingDropdown>
      <TradingDropdown
        trigger={
          <TradingDropdownTrigger className={triggerClasses}>
            <TradingButton {...triggerButtonProps}>
              {t('Overlays')}
            </TradingButton>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent align={contentAlign}>
          {Object.values(Overlay).map((overlay) => (
            <TradingDropdownCheckboxItem
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
              <TradingDropdownItemIndicator />
            </TradingDropdownCheckboxItem>
          ))}
        </TradingDropdownContent>
      </TradingDropdown>
      <TradingDropdown
        trigger={
          <TradingDropdownTrigger className={triggerClasses}>
            <TradingButton {...triggerButtonProps}>
              {t('Studies')}
            </TradingButton>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent align={contentAlign}>
          {Object.values(Study).map((study) => (
            <TradingDropdownCheckboxItem
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
              <TradingDropdownItemIndicator />
            </TradingDropdownCheckboxItem>
          ))}
        </TradingDropdownContent>
      </TradingDropdown>
    </>
  );
};
