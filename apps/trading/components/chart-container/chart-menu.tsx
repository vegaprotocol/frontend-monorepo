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
import { IconNames, type IconName } from '@blueprintjs/icons';
import { useT } from '../../lib/use-t';
import {
  useCandlesChartSettings,
  type Chartlib,
} from './use-candles-chart-settings';

const chartTypeIcon = new Map<ChartType, IconName>([
  [ChartType.AREA, IconNames.TIMELINE_AREA_CHART],
  [ChartType.CANDLE, IconNames.WATERFALL_CHART],
  [ChartType.LINE, IconNames.TIMELINE_LINE_CHART],
  [ChartType.OHLC, IconNames.WATERFALL_CHART],
]);

export const ChartMenu = () => {
  const {
    chartlib,
    interval,
    chartType,
    studies,
    overlays,
    setChartlib,
    setInterval,
    setType,
    setStudies,
    setOverlays,
  } = useCandlesChartSettings();
  const t = useT();

  const contentAlign = 'end';
  const triggerClasses = 'text-xs';
  const triggerButtonProps = { size: 'extra-small' } as const;

  const chartlibDropdown = (
    <TradingDropdown
      trigger={
        <TradingDropdownTrigger className={triggerClasses}>
          <TradingButton {...triggerButtonProps}>{chartlib}</TradingButton>
        </TradingDropdownTrigger>
      }
    >
      <TradingDropdownContent align={contentAlign}>
        <TradingDropdownRadioGroup
          value={chartlib}
          onValueChange={(value: Chartlib) => {
            setChartlib(value);
          }}
        >
          <TradingDropdownRadioItem inset value="tradingview">
            Tradingview
            <TradingDropdownItemIndicator />
          </TradingDropdownRadioItem>

          <TradingDropdownRadioItem inset value="pennant">
            Pennant
            <TradingDropdownItemIndicator />
          </TradingDropdownRadioItem>
        </TradingDropdownRadioGroup>
      </TradingDropdownContent>
    </TradingDropdown>
  );

  switch (chartlib) {
    case 'tradingview': {
      return chartlibDropdown;
    }
    case 'pennant': {
      return (
        <>
          {chartlibDropdown}
          <TradingDropdown
            trigger={
              <TradingDropdownTrigger className={triggerClasses}>
                <TradingButton {...triggerButtonProps}>
                  {t('Interval: {{interval}}', {
                    interval: intervalLabels[interval],
                  })}
                </TradingButton>
              </TradingDropdownTrigger>
            }
          >
            <TradingDropdownContent align={contentAlign}>
              <TradingDropdownRadioGroup
                value={interval}
                onValueChange={(value: Interval) => {
                  setInterval(value);
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
                onValueChange={(value: ChartType) => {
                  setType(value);
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
                  {t('Indicators')}
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
                    const index = overlays.findIndex(
                      (item) => item === overlay
                    );

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
    }
    default: {
      throw new Error('invalid chart lib');
    }
  }
};
