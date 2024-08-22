import type { ReactNode } from 'react';

import locators from '../locators';

export function ListItem<T>({
  item,
  renderItem,
}: Readonly<{ item: T; renderItem: (item: T) => ReactNode }>) {
  return (
    <li
      data-testid={locators.listItem}
      className="border-b border-1 border-surface-0-fg-muted py-2 last:border-0"
    >
      {renderItem(item)}
    </li>
  );
}
