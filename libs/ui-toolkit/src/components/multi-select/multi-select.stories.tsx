import type { StoryFn, Meta } from '@storybook/react';
import { FormGroup } from '../form-group';
import { MultiSelect, MultiSelectOption } from './multi-select';

export default {
  component: MultiSelect,
  title: 'Multi select component',
} as Meta;

const Template: StoryFn = (props) => (
  <FormGroup label="Select an option" labelFor="multi-select">
    <MultiSelect {...props}></MultiSelect>
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Select an option',
  children: (
    <>
      <MultiSelectOption>Option A</MultiSelectOption>
      <MultiSelectOption checked>Option B</MultiSelectOption>
      <MultiSelectOption checked>Option C</MultiSelectOption>
      <MultiSelectOption>Option D</MultiSelectOption>
    </>
  ),
};
