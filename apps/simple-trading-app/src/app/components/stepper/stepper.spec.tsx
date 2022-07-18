import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { Stepper } from './index';
import type { TStep } from './index';

jest.mock('@vegaprotocol/react-helpers', () => {
  return {
    t: (a: string) => a,
    useScreenDimensions: jest.fn(() => ({
      isMobile: true,
    })),
  };
});

// Used to disable the error you get from muted video https://github.com/testing-library/react-testing-library/issues/470
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set: () => {},
});

const steps: TStep[] = [
  {
    label: 'Alpha',
    component: <p>Alpha Content</p>,
  },
  {
    label: 'Beta',
    component: <p>Beta Content</p>,
  },
  {
    label: 'Gamma',
    component: <p>Gamma Content</p>,
  },
];

describe('Stepper Component', () => {
  it('should render it as a list', async () => {
    const { getByLabelText } = await render(<Stepper steps={steps} />);
    expect(getByLabelText('Step by step to make a trade')).toBeTruthy();
    expect(getByLabelText('Step 1')).toBeTruthy();
    expect(getByLabelText('Step 2')).toBeTruthy();
    expect(getByLabelText('Step 3')).toBeTruthy();
  });

  it('should go to the correct tab on click', async () => {
    const { getByRole } = await render(<Stepper steps={steps} />);

    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.click(getByRole('tab', { name: 'Beta' }));
    await waitFor(() => getByRole('tab', { name: 'Gamma' }));
    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(getByRole('tab', { name: 'Beta' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getByRole('tab', { name: 'Gamma' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('should go to the correct tab on right/left arrow press', async () => {
    const { getByRole } = await render(<Stepper steps={steps} />);

    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.keyDown(getByRole('tab', { name: 'Beta' }), {
      key: 'ArrowRight',
    });
    await waitFor(() => getByRole('tab', { name: 'Beta' }));
    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(getByRole('tab', { name: 'Beta' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.keyDown(getByRole('tab', { name: 'Beta' }), { key: 'ArrowLeft' });
    await waitFor(() => getByRole('tab', { name: 'Alpha' }));
    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getByRole('tab', { name: 'Beta' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('should go to next tab on next button click', async () => {
    const { getByRole } = await render(<Stepper steps={steps} />);
    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.click(getByRole('button', { name: 'Next' }));
    await waitFor(() => getByRole('tab', { name: 'Gamma' }));
    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(getByRole('tab', { name: 'Beta' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getByRole('tab', { name: 'Gamma' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
