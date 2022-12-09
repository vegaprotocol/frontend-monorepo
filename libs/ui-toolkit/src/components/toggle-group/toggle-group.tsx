import * as React from 'react';
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';

export interface ToggleGroupItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const ToggleGroup = ({ items }: { items: ToggleGroupItem[] }) => {
  const [selectedValue, setSelectedValue] = React.useState(items[0].value);

  return (
    <RadixToggleGroup.Root
      type="single"
      value={selectedValue}
      onValueChange={(value: React.SetStateAction<string>) => {
        if (value) setSelectedValue(value);
      }}
    >
      {items.map(({ value, label, icon }) => (
        <RadixToggleGroup.Item value={value} aria-label={label}>
          {icon}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  );
};
