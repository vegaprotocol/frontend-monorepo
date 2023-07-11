import fetchMock from 'fetch-mock';
import { addDays } from 'date-fns';
import { act, render, waitFor } from '@testing-library/react';
import { AnnouncementBanner } from './announcements';

const MOCK_URL = 'http://somewhere.com/config.json';
const MOCK_ANNOUNCEMENT = {
  text: 'Attention everyone!',
  url: 'http://click.me/',
  urlText: 'Read more',
};

describe('Announcements', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    fetchMock.reset();
  });

  it('does not display the banner when fetching announcements fails', async () => {
    fetchMock.get(MOCK_URL, 500);
    const { container } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );
    await act(
      async () =>
        await waitFor(() => {
          expect(container.firstChild).toBeEmptyDOMElement();
        })
    );
  });

  it('does not display the banner when there are no announcements', async () => {
    fetchMock.get(MOCK_URL, {
      console: [],
      governance: [],
      explorer: [],
      wallet: [],
      website: [],
    });
    const { container } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );
    await act(
      async () =>
        await waitFor(() => {
          expect(container.firstChild).toBeEmptyDOMElement();
        })
    );
  });

  it('shows the correct announcement', async () => {
    fetchMock.get(MOCK_URL, {
      console: [
        {
          text: 'Console announcement',
        },
      ],
      governance: [
        {
          text: 'Governance announcement',
        },
      ],
      explorer: [
        {
          text: 'Explorer announcement',
        },
      ],
      wallet: [
        {
          text: 'Wallet announcement',
        },
      ],
      website: [
        {
          text: 'Website announcement',
        },
      ],
    });

    const { rerender, findByText } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );
    expect(await findByText('Console announcement')).toBeVisible();

    rerender(<AnnouncementBanner app="governance" configUrl={MOCK_URL} />);
    expect(await findByText('Governance announcement')).toBeVisible();

    rerender(<AnnouncementBanner app="explorer" configUrl={MOCK_URL} />);
    expect(await findByText('Explorer announcement')).toBeVisible();

    rerender(<AnnouncementBanner app="wallet" configUrl={MOCK_URL} />);
    expect(await findByText('Wallet announcement')).toBeVisible();

    rerender(<AnnouncementBanner app="website" configUrl={MOCK_URL} />);
    expect(await findByText('Website announcement')).toBeVisible();
  });

  it('shows the announcement link', async () => {
    fetchMock.get(MOCK_URL, {
      console: [MOCK_ANNOUNCEMENT],
      governance: [],
      explorer: [],
      wallet: [],
      website: [],
    });

    const { findByText, findByRole } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );
    const text = await findByText(MOCK_ANNOUNCEMENT.text);
    const link = (await findByRole('link')) as HTMLAnchorElement;
    const linkText = await findByText(MOCK_ANNOUNCEMENT.urlText);

    expect(text).toBeVisible();
    expect(link).toBeVisible();
    expect(link.href).toBe(MOCK_ANNOUNCEMENT.url);
    expect(linkText).toBeVisible();
  });

  it('shows the first announcement', async () => {
    fetchMock.get(MOCK_URL, {
      console: [
        {
          text: 'First text',
        },
        {
          text: 'Second text',
        },
      ],
      governance: [],
      explorer: [],
      wallet: [],
      website: [],
    });

    const { queryByText } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );

    await waitFor(() => {
      expect(queryByText('First text')).toBeInTheDocument();
    });
  });

  it('does not show expired announcements', async () => {
    fetchMock.get(MOCK_URL, {
      console: [
        {
          text: 'Expired text',
          timing: {
            to: new Date(0).toISOString(),
          },
        },
        {
          text: 'Live text',
        },
      ],
      governance: [],
      explorer: [],
      wallet: [],
      website: [],
    });

    const { queryByText } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );

    await waitFor(() => {
      expect(queryByText('Live text')).toBeInTheDocument();
    });
  });

  it('hides announcements after they expire', async () => {
    const now = new Date();
    const tomorrow = addDays(now, 1);

    fetchMock.get(MOCK_URL, {
      console: [
        {
          text: 'Live text',
          timing: {
            to: tomorrow.toISOString(),
          },
        },
      ],
      governance: [],
      explorer: [],
      wallet: [],
      website: [],
    });

    const { queryByText } = render(
      <AnnouncementBanner app="console" configUrl={MOCK_URL} />
    );

    await waitFor(() => {
      expect(queryByText('Live text')).toBeInTheDocument();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await act(
      async () =>
        await waitFor(() => {
          expect(queryByText('Live text')).not.toBeInTheDocument();
        })
    );
  });
});
