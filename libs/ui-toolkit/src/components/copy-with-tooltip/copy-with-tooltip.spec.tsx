import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { CopyWithTooltip } from './copy-with-tooltip';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

test('CopyWithTooltip', async () => {
  const copyText = 'Text to be copied';
  render(
    <CopyWithTooltip text={copyText}>
      <button>Copy</button>
    </CopyWithTooltip>
  );

  fireEvent.click(screen.getByText('Copy'));

  expect(screen.getByRole('tooltip')).toBeInTheDocument();
  await waitForElementToBeRemoved(() => screen.queryByRole('tooltip'));
});
