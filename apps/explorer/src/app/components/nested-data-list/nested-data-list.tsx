import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@vegaprotocol/utils';
import isObject from 'lodash/isObject';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { IconNames } from '@blueprintjs/icons';
import { VegaColours } from '@vegaprotocol/tailwindcss-config';
import isArray from 'lodash/isArray';

export type UnknownObject = Record<string, unknown>;
export type UnknownArray = unknown[];

interface NestedDataListProps {
  data: UnknownObject | UnknownArray;
  level?: number;
}

interface NestedDataListItemProps {
  label: string;
  value: unknown;
  index: number;
}

export const BORDER_COLOURS = {
  dark: [
    VegaColours.pink.dark,
    VegaColours.purple.dark,
    VegaColours.green.dark,
    VegaColours.blue.dark,
    VegaColours.yellow.dark,
  ],
  light: [
    VegaColours.pink.DEFAULT,
    VegaColours.purple.DEFAULT,
    VegaColours.green.DEFAULT,
    VegaColours.blue.DEFAULT,
    VegaColours.yellow.DEFAULT,
  ],
};

const camelToTitle = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const getBorderColour = (index: number, theme: keyof typeof BORDER_COLOURS) => {
  const colours = BORDER_COLOURS[theme];
  const length = colours.length;
  const modulo = index % length;
  return colours[modulo];
};

const NestedDataListItem = ({
  label,
  value,
  index,
}: NestedDataListItemProps) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleVisible = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      setCollapsed(!isCollapsed);
    },
    [isCollapsed]
  );
  const hasChildren = isObject(value) && !!Object.keys(value).length;
  const title = useMemo(() => camelToTitle(label), [label]);
  const { theme } = useThemeSwitcher();
  const currentLevelBorder = useMemo(
    () => getBorderColour(index, theme),
    [index, theme]
  );
  const nextLevelBorder = useMemo(
    () => getBorderColour(index + 1, theme),
    [index, theme]
  );
  const isArr = isArray(value);

  const listItemClasses = cn('pl-4 border-l-4', {
    'pt-10 last:pb-0': hasChildren,
    'first:pt-0': hasChildren && !index,
    'pt-2': !hasChildren && index,
  });

  const titleClasses = cn({
    'text-xl pl-4 border-l-4 font-alpha calt': hasChildren,
    'text-base font-medium whitespace-nowrap': !hasChildren,
  });

  return (
    <li
      data-testid={title}
      title={title}
      className={listItemClasses}
      style={{ borderColor: currentLevelBorder }}
    >
      <div className="flex flex-wrap">
        <h4 className={titleClasses} style={{ borderColor: nextLevelBorder }}>
          {hasChildren ? (
            <button
              className="flex items-center gap-2"
              type="button"
              onClick={toggleVisible}
            >
              <span className="">{title}</span>
              <small className="px-1 text-sm rounded bg-gs-200">
                {isArr ? 'array' : typeof value}
              </small>
              <Icon
                name={
                  isCollapsed ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_UP
                }
              />
            </button>
          ) : (
            <span className="mr-2">{title}:</span>
          )}
        </h4>
        {!hasChildren && (
          <code className="text-gs-100 mb-2 last:mb-0 break-all">
            {JSON.stringify(value, null, '  ')}
          </code>
        )}
      </div>
      {hasChildren && (
        <div aria-hidden={isCollapsed} className={isCollapsed ? 'hidden' : ''}>
          <NestedDataList
            data={value as UnknownObject | UnknownArray}
            level={index + 1}
          />
        </div>
      )}
    </li>
  );
};

export const sortNestedDataByChildren = (data: UnknownObject | UnknownArray) =>
  Object.keys(data)
    .filter((key) => key)
    .sort((a, b) => {
      const isArr = isArray(data);
      const valA = isArr ? data[+a] : data[a];
      const valB = isArr ? data[+b] : data[b];
      const hasChildrenA = isObject(valA) && !!Object.keys(valA).length;
      const hasChildrenB = isObject(valB) && !!Object.keys(valB).length;

      if (hasChildrenA && !hasChildrenB) {
        return 1;
      }

      if (!hasChildrenA && hasChildrenB) {
        return -1;
      }

      return 0;
    });

export const NestedDataList = ({ data, level = 0 }: NestedDataListProps) => {
  const nestedItems = useMemo(() => {
    const sortedData = sortNestedDataByChildren(data);
    const isArr = isArray(data);

    if (sortedData.length) {
      return sortedData.map((key) => (
        <NestedDataListItem
          key={key}
          label={key}
          value={isArr ? data[Number(key)] : data[key]}
          index={level}
        />
      ));
    }

    return null;
  }, [data, level]);

  return <ul className="list-none">{nestedItems}</ul>;
};
