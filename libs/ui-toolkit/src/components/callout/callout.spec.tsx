import { render, screen } from '@testing-library/react';
import { Callout } from '.';
import { Intent } from '../../utils/intent';

it('renders content within callout', () => {
  render(<Callout>Content</Callout>);
  expect(screen.getByTestId('callout')).toHaveTextContent('Content');
});

it('renders title and icon', () => {
  render(<Callout iconName="endorsed" title="title" />);
  expect(
    screen.getByTestId('callout').querySelector('svg')
  ).toBeInTheDocument();
  expect(screen.getByText('title')).toBeInTheDocument();
});

const intents = Object.values(Intent).filter((i) => i !== Intent.Prompt);

it.each(intents)('Applies class for %s', (intent) => {
  render(<Callout intent={intent} />);
  expect(screen.getByTestId('callout')).toHaveClass(
    `shadow-intent-${intent.toLowerCase()}`
  );
});

it(`Applies class for progress`, () => {
  render(<Callout intent={Intent.Prompt} />);
  expect(screen.getByTestId('callout')).toHaveClass(
    'shadow-black',
    'dark:shadow-intent-prompt'
  );
});
