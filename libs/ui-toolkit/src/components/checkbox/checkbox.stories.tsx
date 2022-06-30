import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Checkbox } from './checkbox';
import { useState } from 'react';

export default {
  component: Checkbox,
  title: 'Checkbox',
} as ComponentMeta<typeof Checkbox>;

export const Controlled: ComponentStory<typeof Checkbox> = () => {
  const [checkboxState, setCheckboxState] = useState<
    'checked' | 'unchecked' | 'indeterminate'
  >('indeterminate');

  return (
    <Checkbox
      label={'controlled - initially indeterminate'}
      state={checkboxState}
      onChange={() => {
        if (
          checkboxState === 'indeterminate' ||
          checkboxState === 'unchecked'
        ) {
          setCheckboxState('checked');
        }

        if (checkboxState === 'checked') {
          setCheckboxState('unchecked');
        }
      }}
    />
  );
};

export const Default: ComponentStory<typeof Checkbox> = () => (
  <Checkbox label={'uncontrolled - default checkbox behaviour'} />
);

export const Error: ComponentStory<typeof Checkbox> = () => (
  <Checkbox label={'error'} error={true} />
);

export const Disabled: ComponentStory<typeof Checkbox> = () => (
  <Checkbox label={'disabled'} disabled />
);
