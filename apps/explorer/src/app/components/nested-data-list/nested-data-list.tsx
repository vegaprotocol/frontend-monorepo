import React, { useCallback, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { IconNames } from '@blueprintjs/icons';
import { VegaColours } from '@vegaprotocol/tailwindcss-config';
import isArray from 'lodash/isArray';

interface NestedDataListProps {
  data: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [key: string]: any;
  };
  index?: number;
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
  const [isCollapsed, setCollapsed] = useState(true);
  const toggleVisible = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      setCollapsed(!isCollapsed);
    },
    [isCollapsed]
  );
  const hasChildren = isObject(value) && !!Object.keys(value).length;
  const title = useMemo(() => camelToTitle(label), [label]);
  const theme = useContext(ThemeContext);
  const currentLevelBorder = useMemo(
    () => getBorderColour(index, theme),
    [index, theme]
  );
  const nextLevelBorder = useMemo(
    () => getBorderColour(index + 1, theme),
    [index, theme]
  );
  const isArr = isArray(value);

  const listItemClasses = classNames('pl-4 border-l-4', {
    'pt-10 last:pb-0': hasChildren,
    'first:pt-0': hasChildren && !index,
    'pt-2': !hasChildren && index,
  });

  const titleClasses = classNames({
    'text-xl pl-4 border-l-4 font-alpha': hasChildren,
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
              <small className="px-1 text-sm rounded bg-vega-light-200 dark:bg-vega-dark-200">
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
          <code className="text-vega-light-400 mb-2 last:mb-0 dark:text-vega-dark-400 break-all">
            {JSON.stringify(value, null, '  ')}
          </code>
        )}
      </div>
      {hasChildren && (
        <div aria-hidden={isCollapsed} className={isCollapsed ? 'hidden' : ''}>
          <NestedDataList index={index + 1} data={value} />
        </div>
      )}
    </li>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const sortNestedDataByChildren = (data: { [key: string]: any }) =>
  Object.keys(data)
    .filter((key) => key)
    .sort((a, b) => {
      const hasChildrenA = isObject(data[a]) && !!Object.keys(data[a]).length;
      const hasChildrenB = isObject(data[b]) && !!Object.keys(data[b]).length;

      if (hasChildrenA && !hasChildrenB) {
        return 1;
      }

      if (!hasChildrenA && hasChildrenB) {
        return -1;
      }

      return 0;
    });

export const NestedDataList = ({ data, index = 0 }: NestedDataListProps) => {
  const nestedItems = useMemo(
    () =>
      sortNestedDataByChildren(data).map((key) => (
        <NestedDataListItem
          key={key}
          label={key}
          value={data[key]}
          index={index}
        />
      )),
    [data, index]
  );

  return <ul className="list-none">{nestedItems}</ul>;
};
