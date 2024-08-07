import type { ReactNode } from 'react';

import locators from '../locators';
import { ListItem } from './list-item';

export function List<T>({
  items,
  className,
  empty,
  idProp,
  renderItem,
}: Readonly<{
  items: T[];
  empty?: ReactNode;
  idProp: keyof T;
  renderItem: (item: T) => ReactNode;
  className?: string;
}>) {
  if (items.length === 0) {
    return empty;
  }
  return (
    <ul className={className} data-testid={locators.list}>
      {items.map((item) => (
        <ListItem
          key={item[idProp]?.toString()}
          item={item}
          renderItem={renderItem}
        />
      ))}
    </ul>
  );
}
