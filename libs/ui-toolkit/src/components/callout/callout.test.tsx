import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Callout } from '.';

test('It renders content within callout', () => {
  render(<Callout>Content</Callout>);
  expect(screen.getByTestId('callout')).toHaveTextContent('Content');
});

test('It renders title and icon', () => {
  render(<Callout iconName="endorsed" title="title" />);
  expect(
    screen.getByTestId('callout').querySelector('svg')
  ).toBeInTheDocument();
  expect(screen.getByText('title')).toBeInTheDocument();
});

const intents = ['danger', 'warning', 'prompt', 'success', 'help'] as [
  'danger',
  'warning',
  'prompt',
  'success',
  'help'
];

intents.map((intent) =>
  test(`Applies class for ${intent}`, () => {
    render(<Callout intent={intent} />);
    expect(screen.getByTestId('callout')).toHaveClass(
      `shadow-intent-${intent}`
    );
  })
);

test(`Applies class for progress`, () => {
  render(<Callout intent="progress" />);
  expect(screen.getByTestId('callout')).toHaveClass(
    'shadow-black',
    'dark:shadow-white'
  );
});
