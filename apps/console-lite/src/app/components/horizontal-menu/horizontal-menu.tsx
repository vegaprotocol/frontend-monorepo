import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export interface Item {
  name: string;
  id: string;
  url?: string;
  isActive?: boolean;
  color?: string;
  cssClass?: string;
}

interface Props {
  active?: string;
  cssClass?: string[];
  items: Item[];
  'data-testid'?: string;
  'aria-label'?: string;
}

const MenuItem = ({ id, name, url, isActive, cssClass }: Item): JSX.Element => {
  if (!url) {
    return <span data-testid={id}>{name}</span>;
  }
  return (
    <Link
      to={url}
      aria-label={name}
      className={classNames('pl-0 hover:opacity-75', cssClass, {
        active: isActive,
      })}
      data-testid={id}
    >
      {name}
    </Link>
  );
};

const findActive = (active?: string, items?: Item[]) => {
  if (!active && items?.length) {
    return 0;
  }
  return items?.length
    ? items.findIndex((item) => item.id === active) || 0
    : -1;
};

export const HorizontalMenu = ({
  items,
  active,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}: Props) => {
  const [activeNumber, setActiveNumber] = useState<number>(
    findActive(active, items)
  );
  const slideContRef = useRef<HTMLUListElement | null>(null);
  const [sliderStyles, setSliderStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveNumber(findActive(active, items));
  }, [active, items]);

  useEffect(() => {
    const contStyles = (
      slideContRef.current as HTMLUListElement
    ).getBoundingClientRect();
    const selectedStyles = (slideContRef.current as HTMLUListElement).children[
      activeNumber
    ]?.getBoundingClientRect();
    const styles: Record<string, string> = selectedStyles
      ? {
          backgroundColor: items[activeNumber].color || '',
          width: `${selectedStyles.width}px`,
          left: `${selectedStyles.left - contStyles.left}px`,
        }
      : {};
    setSliderStyles(styles);
  }, [activeNumber, slideContRef, items]);

  return items.length ? (
    <ul
      ref={slideContRef}
      className="grid grid-flow-col auto-cols-min gap-4 relative pb-2 mb-2"
      data-testid={dataTestId}
      aria-label={ariaLabel}
    >
      {items.map((item, i) => (
        <li key={item.id} className="md:mr-2 whitespace-nowrap">
          <MenuItem {...item} isActive={i === activeNumber} />
        </li>
      ))}
      <li
        className="absolute bottom-0 h-[2px] transition-left duration-300 dark:bg-white bg-black"
        key="slider"
        style={sliderStyles}
      />
    </ul>
  ) : null;
};

export default HorizontalMenu;
