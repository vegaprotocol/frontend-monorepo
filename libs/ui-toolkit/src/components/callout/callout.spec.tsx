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
  expect(screen.getByTestId('callout')).toHaveClass('border-intent-danger');
});

it(`Applies class for warning intent`, () => {
  render(<Callout intent={Intent.Warning} />);
  expect(screen.getByTestId('callout')).toHaveClass('border-intent-warning');
});

it(`Applies class for danger intent`, () => {
  render(<Callout intent={Intent.Danger} />);
  expect(screen.getByTestId('callout')).toHaveClass('border-intent-danger');
});

it(`Applies class for primary intent`, () => {
  render(<Callout intent={Intent.Primary} />);
  expect(screen.getByTestId('callout')).toHaveClass('border-intent-primary');
});

it(`Applies class for none intent`, () => {
  render(<Callout />);
  expect(screen.getByTestId('callout')).toHaveClass('border-intent-none ');
});
