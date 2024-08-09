import { useEnvironment } from '@vegaprotocol/environment';
import type { Statistics, NodeData } from '../../config/stats-fields';
import { fieldsDefinition } from '../../config/stats-fields';
import { useStatsQuery } from './__generated__/Stats';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';

interface StatsManagerProps {
  className?: string;
}

export const StatsManager = ({ className }: StatsManagerProps) => {
  const { VEGA_ENV } = useEnvironment();
  const { data, startPolling, stopPolling } = useStatsQuery();

  useEffect(() => {
    startPolling(500);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const getValue = (field: keyof NodeData | keyof Statistics | 'epoch') => {
    if (['stakedTotal', 'totalNodes', 'inactiveNodes'].includes(field)) {
      return data?.nodeData?.[field as keyof NodeData];
    } else if (field === 'epoch') {
      return data?.epoch.id;
    }
    return data?.statistics?.[field as keyof Statistics];
  };

  const panels = fieldsDefinition.map(
    ({ field, title, description, formatter, goodThreshold }) => ({
      field,
      title,
      description,
      value: formatter ? formatter(getValue(field)) : getValue(field),
      good:
        goodThreshold && getValue(field)
          ? goodThreshold(getValue(field))
          : undefined,
    })
  );

  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 gap-3 w-full self-start justify-self-center',
        className
      )}
    >
      {panels.map(({ field, title, description, value, good }, i) => (
        <div
          key={i}
          className={cn(
            'border rounded p-2 relative border-gs-600',
            {
              'col-span-2': field === 'chainId',
            },
            {
              'bg-transparent border-gs-200': good === undefined,
              'bg-vega-pink-300 dark:bg-vega-pink-700 border-vega-pink-500 dark:border-vega-pink-500':
                good !== undefined && !good,
              'bg-vega-green-300 dark:bg-vega-green-700 border-vega-green-500 dark:border-vega-green-500':
                good !== undefined && good,
            }
          )}
        >
          <div className="uppercase flex items-center gap-2 text-xs font-alpha calt">
            <div
              className={cn('w-2 h-2 rounded-full', {
                'bg-gs-200': good === undefined,
                'bg-vega-pink dark:bg-vega-pink': good !== undefined && !good,
                'bg-vega-green dark:bg-vega-green': good !== undefined && good,
              })}
            ></div>
            <div data-testid="stats-title">{title}</div>
            {description && (
              <Tooltip description={description} align="center">
                <div className="absolute top-1 right-2 text-gs-200 cursor-help">
                  <Icon name="info-sign" size={3} />
                </div>
              </Tooltip>
            )}
          </div>
          <div data-testid="stats-value" className="font-mono text-xl pt-2">
            {value} {field === 'status' && `(${VEGA_ENV})`}
          </div>
        </div>
      ))}
    </div>
  );
};
