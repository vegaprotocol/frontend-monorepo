import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Callout } from '.';

test('It renders content within callout', () => {
  render(<Callout>Content</Callout>);
  expect(screen.getByTestId('callout')).toHaveTextContent('Content');
});

test('It renders title and icon', () => {
  render(<Callout icon={<div data-testid="icon" />} title="title" />);
  expect(screen.getByTestId('icon')).toBeInTheDocument();
  expect(screen.getByText('title')).toBeInTheDocument();
});

const intents = ['warn', 'action', 'error', 'success'] as [
  'warn',
  'action',
  'error',
  'success'
];

intents.map((intent) =>
  test(`Applies class for ${intent}`, () => {
    render(<Callout intent={intent} />);
    expect(screen.getByTestId('callout')).toHaveClass(`callout--${intent}`);
  })
);
