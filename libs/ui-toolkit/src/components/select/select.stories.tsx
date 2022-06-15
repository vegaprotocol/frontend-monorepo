import { Select, SelectItem } from './select';
import type { ComponentMeta } from '@storybook/react';

export default {
  title: 'Select',
} as ComponentMeta<typeof Select>;

export const DefaultSelect = () => (
  <Select defaultValue="1">
    <SelectItem value="1">Item 1</SelectItem>
    <SelectItem value="2">Item 2</SelectItem>
    <SelectItem value="3">Item 3</SelectItem>
  </Select>
);

export const WithError = () => (
  <Select defaultValue="1" hasError={true}>
    <SelectItem value="1">Item 1</SelectItem>
    <SelectItem value="2">Item 2</SelectItem>
    <SelectItem value="3">Item 3</SelectItem>
  </Select>
);

export const WithDisabledItems = () => (
  <Select defaultValue="2">
    <SelectItem value="1" disabled={true}>
      Item 1
    </SelectItem>
    <SelectItem value="2">Item 2</SelectItem>
    <SelectItem value="3" disabled={true}>
      Item 3
    </SelectItem>
  </Select>
);
