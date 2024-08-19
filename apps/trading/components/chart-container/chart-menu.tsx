import {
  ChartType,
  Overlay,
  Study,
  chartTypeLabels,
  overlayLabels,
  studyLabels,
} from 'pennant';
import { Trans } from 'react-i18next';
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
import { type Interval } from '@vegaprotocol/types';
import { useEnvironment } from '@vegaprotocol/environment';
import { ALLOWED_TRADINGVIEW_HOSTNAMES } from '@vegaprotocol/trading-view';
import { IconNames, type IconName } from '@blueprintjs/icons';
import { useChartSettings } from './use-chart-settings';
import { useT } from '../../lib/use-t';
import { SUPPORTED_INTERVALS } from './constants';

const chartTypeIcon = new Map<ChartType, IconName>([
  [ChartType.AREA, IconNames.TIMELINE_AREA_CHART],
  [ChartType.CANDLE, IconNames.WATERFALL_CHART],
  [ChartType.LINE, IconNames.TIMELINE_LINE_CHART],
  [ChartType.OHLC, IconNames.WATERFALL_CHART],
]);

export const ChartMenu = () => {
  const { CHARTING_LIBRARY_PATH } = useEnvironment();
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
  } = useChartSettings();
  const t = useT();

  const contentAlign = 'end';
  const triggerClasses = 'text-xs';
  const triggerButtonProps = { size: 'xs' } as const;

  const isPennant = chartlib === 'pennant';
  const commonMenuItems = (
    <Button
      onClick={() => {
        setChartlib(isPennant ? 'tradingview' : 'pennant');
      }}
      size="xs"
      data-testid="chartlib-toggle-button"
    >
      {isPennant ? 'TradingView' : t('Vega chart')}
    </Button>
  );

  const pennantMenuItems = (
    <>
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger className={triggerClasses}>
            <Button {...triggerButtonProps}>
              {t('Interval: {{interval}}', {
                interval: t(interval),
              })}
            </Button>
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
            {SUPPORTED_INTERVALS.map((timeInterval) => (
              <DropdownMenuRadioItem
                key={timeInterval}
                inset
                value={timeInterval}
              >
                {t(timeInterval)}
                <DropdownMenuItemIndicator />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger className={triggerClasses}>
            <Button {...triggerButtonProps}>
              <Icon name={chartTypeIcon.get(chartType) as IconName} />
            </Button>
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
            <Button {...triggerButtonProps}>{t('Indicators')}</Button>
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

  const tradingViewMenuItems = (
    <p className="text-xs mr-2 whitespace-nowrap">
      <Trans
        i18nKey="Chart by <0>TradingView</0>"
        components={[
          // eslint-disable-next-line
          <a
            className="underline"
            target="_blank"
            href="https://www.tradingview.com"
          />,
        ]}
      />
    </p>
  );

  if (!ALLOWED_TRADINGVIEW_HOSTNAMES.includes(window.location.hostname)) {
    return pennantMenuItems;
  }

  if (!CHARTING_LIBRARY_PATH) {
    return pennantMenuItems;
  }

  switch (chartlib) {
    case 'tradingview': {
      return (
        <>
          {tradingViewMenuItems}
          {commonMenuItems}
        </>
      );
    }
    case 'pennant': {
      return (
        <>
          {pennantMenuItems}
          {commonMenuItems}
        </>
      );
    }
    default: {
      throw new Error('invalid chart lib');
    }
  }
};
