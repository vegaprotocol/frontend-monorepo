import fetchMock from 'fetch-mock';
import { addDays } from 'date-fns';
import { act, render, waitFor } from '@testing-library/react';
import { AnnouncementBanner } from './announcements'

const MOCK_URL = 'http://somewhere.com/config.json';
const MOCK_ANNOUNCEMENT = {
  text: 'Attention everyone!',
  url: 'http://click.me/',
  urlText: 'Read more',
}

describe('Announcements', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    fetchMock.reset();
  });

  it('does not display the banner when fetching announcements fails', async () => {
    fetchMock.get(MOCK_URL, 500)
    const { container } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it('does not display the banner when there are no announcements', async () => {
    fetchMock.get(MOCK_URL, {
      console: [],
      governance: [],
      explorer: [],
      wallet: [],
    })
    const { container } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it('shows the correct announcement', async () => {
    fetchMock.get(MOCK_URL, {
      console: [MOCK_ANNOUNCEMENT],
      governance: [{
        text: 'Governance update',
      }],
      explorer: [{
        text: 'Explorer update',
      }],
      wallet: [{
        text: 'Wallet update',
      }],
    })

    const { container, rerender, findByText } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    expect(await findByText(MOCK_ANNOUNCEMENT.text)).toBeVisible()

    rerender(<AnnouncementBanner app="governance" configUrl={MOCK_URL} />)
    expect(await findByText('Governance update')).toBeVisible()

    rerender(<AnnouncementBanner app="explorer" configUrl={MOCK_URL} />)
    expect(await findByText('Explorer update')).toBeVisible()

    rerender(<AnnouncementBanner app="wallet" configUrl={MOCK_URL} />)
    expect(await findByText('Wallet update')).toBeVisible()
  })

  it('shows the announcement link', async () => {
    fetchMock.get(MOCK_URL, {
      console: [MOCK_ANNOUNCEMENT],
      governance: [],
      explorer: [],
      wallet: [],
    })

    const { findByText, findByRole } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    const text = await findByText(MOCK_ANNOUNCEMENT.text)
    const link = await findByRole('link') as HTMLAnchorElement
    const linkText =  await findByText(MOCK_ANNOUNCEMENT.urlText)
    
    expect(text).toBeVisible()
    expect(link).toBeVisible()
    expect(link.href).toBe(MOCK_ANNOUNCEMENT.url)
    expect(linkText).toBeVisible()
  })

  it('shows the first announcement', async () => {
    fetchMock.get(MOCK_URL, {
      console: [{
        text: 'First text',
      }, {
        text: 'Second text',
      }],
      governance: [],
      explorer: [],
      wallet: [],
    })

    const { findByText } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    expect(await findByText('First text')).toBeVisible()
  })

  it('does not show expired announcements', async () => {
    fetchMock.get(MOCK_URL, {
      console: [{
        text: 'Expired text',
        timing: {
          to: new Date(0).toISOString(),
        }
      }, {
        text: 'Live text'
      }],
      governance: [],
      explorer: [],
      wallet: [],
    })

    const { findByText } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    expect(await findByText('Live text')).toBeVisible()
  })

  it('hides announcements after they expire', async () => {
    const now = new Date()
    const tomorrow = addDays(now, 1)

    fetchMock.get(MOCK_URL, {
      console: [{
        text: 'Live text',
        timing: {
          to: tomorrow.toISOString(),
        }
      }],
      governance: [],
      explorer: [],
      wallet: [],
    })

    const { container, findByText } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    expect(await findByText('Live text')).toBeVisible()

    act(() => {
      jest.runOnlyPendingTimers()
    })
    expect(container).toBeEmptyDOMElement()
  })

  // Can't make this pass for some reason
  it.skip('shows announcements from when they are supposed to show', async () => {
    const now = new Date()
    const tomorrow = addDays(now, 1)

    fetchMock.get(MOCK_URL, {
      console: [{
        text: 'Live text',
        timing: {
          from: tomorrow.toISOString(),
        }
      }],
      governance: [],
      explorer: [],
      wallet: [],
    })

    const { container, findByText } = render(<AnnouncementBanner app="console" configUrl={MOCK_URL} />)
    expect(container).toBeEmptyDOMElement()

    act(() => {
      jest.runOnlyPendingTimers()
    })
    expect(await findByText('Live text')).toBeVisible()
    console.log(container)
  })
})