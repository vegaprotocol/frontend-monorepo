import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SecondsAgo } from './index';

describe('Seconds ago', () => {
  it('should render successfully', () => {
    const dateInString = Date.now().toString();
    const { baseElement } = render(<SecondsAgo date={dateInString} />);
    expect(baseElement).toBeTruthy();
  });

  it('should show the correct amount of seconds ago', async () => {
    const secondsToWait = 2;
    const dateInString = new Date().toString();

    await new Promise((r) => setTimeout(r, secondsToWait * 1000));

    render(<SecondsAgo date={dateInString} />);

    expect(
      screen.getByText(`${secondsToWait} seconds ago`)
    ).toBeInTheDocument();
  });
});
