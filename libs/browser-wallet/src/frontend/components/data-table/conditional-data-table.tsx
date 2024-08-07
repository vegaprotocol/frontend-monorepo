import get from 'lodash/get';
import has from 'lodash/has';
import type { ReactNode } from 'react';

import { DataTable } from './data-table';

export interface RowConfig<T> {
  render: (property: any, properties: any, data: T) => [ReactNode, ReactNode];
  prop: keyof T;
  props?: (keyof T)[];
}

export function ConditionalDataTable<T>({
  items,
  data,
}: {
  items: RowConfig<T>[];
  data: T;
}) {
  const filteredItems = items
    .filter(({ prop, props }) => {
      if (prop && !has(data, prop)) {
        return false;
      }
      if (props) {
        const hasAllProperties = props.every((p) => has(data, p));
        if (!hasAllProperties) {
          return false;
        }
      }
      const value = get(data, prop);
      // Exclude 0 because 0 could be permitted for certain values
      return value !== undefined && value !== null && value !== '';
    })
    .map(({ render, prop, props }) => {
      const property = get(data, prop);
      const properties = Object.fromEntries(
        props?.map((p) => [p, get(data, p)]) || []
      );
      return render(property, properties, data);
    });
  return <DataTable items={filteredItems} />;
}
