import React from 'react';
import type { ReactNode } from 'react';
import { Panel } from '../panel';
import {
  CopyWithTooltip,
  Icon,
  Intent,
  Lozenge,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

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
  return (
    <Panel>
      <section className="flex gap-3 mb-1 items-center">
        <h3 className="text-lg font-bold">{title}</h3>
        <p title={id} className="truncate ...">
          {id}
        </p>
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
        {copy && (
          <CopyWithTooltip text={id}>
            <button className="underline">
              <Icon name="duplicate" className="ml-2" />
            </button>
          </CopyWithTooltip>
        )}
      </section>
      {children}
    </Panel>
  );
};
