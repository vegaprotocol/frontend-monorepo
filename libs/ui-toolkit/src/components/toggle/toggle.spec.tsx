import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Toggle } from './toggle';

describe('Toggle', () => {
  it('should render buttons successfully', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('supports more than 2 inputs', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
          {
            label: 'Option 3',
            value: 'test-3',
          },
        ]}
      />
    );
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('uncontrolled toggle initially has no checked item', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
      />
    );
    expect(screen.getByDisplayValue('test-1').matches(':checked')).toBeFalsy();
    expect(screen.getByDisplayValue('test-2').matches(':checked')).toBeFalsy();
  });

  it('uncontrolled toggle displays correct checked item after click', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
      />
    );
    const button = screen.getByText('Option 1');
    fireEvent.click(button);
    expect(screen.getByDisplayValue('test-1').matches(':checked')).toBeTruthy();
    expect(screen.getByDisplayValue('test-2').matches(':checked')).toBeFalsy();
  });

  it('controlled toggle displays correct checked value, first option selected', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
        checkedValue={'test-1'}
        onChange={() => null}
      />
    );
    expect(screen.getByDisplayValue('test-1')).toHaveProperty('checked', true);
  });

  it('controlled toggle displays correct checked value, second option selected', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
        checkedValue={'test-2'}
        onChange={() => null}
      />
    );
    expect(screen.getByDisplayValue('test-2')).toHaveProperty('checked', true);
  });

  it('onchange handler returning null results in nothing happening', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
        checkedValue={'test-2'}
        onChange={() => null}
      />
    );
    expect(screen.getByDisplayValue('test-2')).toHaveProperty('checked', true);
    const button = screen.getByText('Option 1');
    fireEvent.click(button);
    expect(screen.getByDisplayValue('test-2')).toHaveProperty('checked', true);
  });

  it('onchange handler controlling state sets new value', () => {
    const ComponentWrapper = () => {
      const [value, setValue] = useState('test-2');

      return (
        <Toggle
          name="test"
          toggles={[
            {
              label: 'Option 1',
              value: 'test-1',
            },
            {
              label: 'Option 2',
              value: 'test-2',
            },
          ]}
          checkedValue={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };

    render(<ComponentWrapper />);
    expect(screen.getByDisplayValue('test-2')).toHaveProperty('checked', true);
    const button = screen.getByText('Option 1');
    fireEvent.click(button);
    expect(screen.getByDisplayValue('test-1')).toHaveProperty('checked', true);
  });
});
