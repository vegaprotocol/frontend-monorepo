import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { Checkbox, CheckboxProperties } from '.';

const renderComponent = (
  properties: Omit<CheckboxProperties<any>, 'control'>
) => {
  const Comp = () => {
    const { control } = useForm();

    return <Checkbox control={control} {...properties} />;
  };
  render(<Comp />);
};

describe('Checkbox', () => {
  it('renders checkbox with label correctly', () => {
    renderComponent({
      name: 'test',
      label: 'Test Label',
    });
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders disabled checkbox correctly', () => {
    renderComponent({
      name: 'test',
      label: 'Test Label',
      disabled: true,
    });
    expect(screen.getByLabelText('Test Label')).toBeDisabled();
  });

  it('updates checkbox value correctly', () => {
    renderComponent({
      name: 'test',
      label: 'Test Label',
    });
    const checkbox = screen.getByLabelText('Test Label');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
