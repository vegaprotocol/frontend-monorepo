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

it(`Applies class for success intent`, () => {
  render(<Callout intent={Intent.Danger} />);
  expect(screen.getByTestId('callout')).toHaveClass('shadow-danger');
});

it(`Applies class for warning intent`, () => {
  render(<Callout intent={Intent.Warning} />);
  expect(screen.getByTestId('callout')).toHaveClass('shadow-warning');
});

it(`Applies class for danger intent`, () => {
  render(<Callout intent={Intent.Danger} />);
  expect(screen.getByTestId('callout')).toHaveClass('shadow-danger');
});

it(`Applies class for primary intent`, () => {
  render(<Callout intent={Intent.Primary} />);
  expect(screen.getByTestId('callout')).toHaveClass(
    'shadow-vega-pink',
    'dark:shadow-vega-yellow'
  );
});

it(`Applies class for none intent`, () => {
  render(<Callout />);
  expect(screen.getByTestId('callout')).toHaveClass(
    'shadow-black',
    'dark:shadow-white'
  );
});
