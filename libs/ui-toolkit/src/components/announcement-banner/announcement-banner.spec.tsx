import { render } from '@testing-library/react';
import { AnnouncementBanner } from './announcement-banner';

describe('Banner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AnnouncementBanner>Hi</AnnouncementBanner>);
    expect(baseElement).toBeTruthy();
  });
});
