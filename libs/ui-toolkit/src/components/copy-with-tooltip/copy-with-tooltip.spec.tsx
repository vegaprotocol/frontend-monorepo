import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { CopyWithTooltip } from './copy-with-tooltip';
import { TooltipProvider } from '../tooltip';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

it('CopyWithTooltip', async () => {
  const copyText = 'Text to be copied';
  render(
    <TooltipProvider>
      <CopyWithTooltip text={copyText}>
        <button>Copy</button>
      </CopyWithTooltip>
    </TooltipProvider>
  );

  fireEvent.click(screen.getByText('Copy'));

  expect(screen.getByRole('tooltip')).toBeInTheDocument();
  await waitForElementToBeRemoved(() => screen.queryByRole('tooltip'));
});
