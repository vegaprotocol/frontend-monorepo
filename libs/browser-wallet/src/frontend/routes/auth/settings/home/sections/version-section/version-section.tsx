import { SubHeader } from '@/components/sub-header';
import { VegaSection } from '@/components/vega-section';

// import packageJson from '../../../../../../../../package.json';

export const locators = {
  settingsVersionTitle: 'settings-version-title',
  settingsVersionNumber: 'settings-version-number',
};

export const VersionSection = () => {
  return (
    <VegaSection>
      <SubHeader content="Vega wallet version" />
      {/* <div
        className="text-white text-lg mt-1"
        data-testid={locators.settingsVersionNumber}
      >
        {packageJson.version}
      </div> */}
    </VegaSection>
  );
};
