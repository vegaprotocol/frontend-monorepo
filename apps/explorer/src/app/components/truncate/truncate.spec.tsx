import { render, screen } from '@testing-library/react';
import { TruncateInline } from './truncate';

describe('Truncate', () => {
  it('should render successfully', () => {
    render(
      <TruncateInline data-testid="truncate-test" text={'Texty McTextFace'} />
    );

    expect(screen.getByTestId('truncate-test')).toBeInTheDocument();
  });

  it('it truncates as expected', () => {
    const test = 'randomstringblahblah';
    const startChars = 3;
    const endChars = 3;
    const expectedString = `${test.slice(0, startChars)}…${test.slice(
      -endChars
    )}`;

    render(
      <TruncateInline text={test} startChars={startChars} endChars={endChars} />
    );

    expect(screen.getByText(expectedString)).toBeInTheDocument();
  });

  it("it doesn't truncate if the string is too short", () => {
    const test = 'randomstringblahblah';
    const startChars = test.length;
    const endChars = test.length;

    render(
      <TruncateInline text={test} startChars={startChars} endChars={endChars} />
    );

    expect(screen.getByText(test)).toBeInTheDocument();
  });
});
