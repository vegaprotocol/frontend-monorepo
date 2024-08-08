import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Panel } from '../panel';
import {
  CopyWithTooltip,
  Icon,
  Intent,
  Lozenge,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { TruncateInline } from '../truncate/truncate';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';

interface InfoPanelProps {
  children?: ReactNode | ReactNode[];
  title: string;
  id: string;
  type?: string;
  copy?: boolean;
}

export const InfoPanel = ({
  children,
  title,
  id,
  type,
  copy = true,
}: InfoPanelProps) => {
  const { screenSize } = useScreenDimensions();
  const isTruncated = useMemo(
    () => ['xs', 'sm', 'md', 'lg'].includes(screenSize),
    [screenSize]
  );
  const isDesktop = useMemo(() => ['lg'].includes(screenSize), [screenSize]);
  const visibleChars = useMemo(() => (isDesktop ? 20 : 10), [isDesktop]);
  return (
    <Panel>
      <section className="flex justify-between items-center items-center">
        <div>
          <div className="flex gap-3 items-center">
            <h3 className="text-lg font-medium">{title}</h3>
            {isTruncated ? (
              <TruncateInline
                text={id}
                startChars={visibleChars}
                endChars={visibleChars}
                className="text-gs-100"
              />
            ) : (
              <p title={id} className="text-gs-100 truncate">
                {id}
              </p>
            )}

            {type && (
              <Lozenge
                className="text-xs leading-relaxed cursor-auto"
                variant={Intent.None}
              >
                <Tooltip side="top" description={type} align="center">
                  <span>{type}</span>
                </Tooltip>
              </Lozenge>
            )}
          </div>
          <div>{children}</div>
        </div>
        {copy && (
          <CopyWithTooltip text={id}>
            <button className="bg-gs-100 rounded-sm py-2 px-3">
              <Icon name="duplicate" />
            </button>
          </CopyWithTooltip>
        )}
      </section>
    </Panel>
  );
};
