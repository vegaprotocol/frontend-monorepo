import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Callout } from '.';
import { Intent } from '../../utils/intent';

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

const intents = Object.values(Intent).filter((i) => i !== Intent.Progress);

test.each(intents)('Applies class for %s', (intent) => {
  render(<Callout intent={intent} />);
  expect(screen.getByTestId('callout')).toHaveClass(
    `shadow-intent-${intent.toLowerCase()}`
  );
});

test(`Applies class for progress`, () => {
  render(<Callout intent={Intent.Progress} />);
  expect(screen.getByTestId('callout')).toHaveClass(
    'shadow-black',
    'dark:shadow-white'
  );
});
