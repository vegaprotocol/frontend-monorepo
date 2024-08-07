import { render, screen } from '@testing-library/react';

import { locators as headerLocators } from '@/components/sub-header';

// import packageJson from '../../../../../../package.json';
import { locators, VersionSection } from './version-section';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('VersionSection', () => {
  it('renders the section header correctly', () => {
    render(<VersionSection />);
    const headerElement = screen.getByTestId(headerLocators.subHeader);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the version number correctly', () => {
    render(<VersionSection />);
    const versionNumberElement = screen.getByTestId(
      locators.settingsVersionNumber
    );
    expect(versionNumberElement).toBeInTheDocument();
    // expect(versionNumberElement).toHaveTextContent(packageJson.version);
  });
});
