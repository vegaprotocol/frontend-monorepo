import type { ReactNode } from 'react';
import { useState } from 'react';

import { CopyWithCheckmark } from '../copy-with-check';
import { Hide } from '../icons/hide';
import { Show } from '../icons/show';
import locators from '../locators';

export interface HiddenContainerProperties {
  text: ReactNode;
  hiddenInformation: string;
  onChange?: (show: boolean) => void;
  wrapContent?: boolean;
}

export const HiddenContainer = ({
  hiddenInformation,
  onChange,
  text,
  wrapContent = false,
}: HiddenContainerProperties) => {
  const [showInformation, setShowInformation] = useState(false);
  return showInformation ? (
    <div data-testid={locators.mnemonicContainerShown}>
      <code
        style={wrapContent ? { wordBreak: 'break-all' } : undefined}
        data-testid={locators.mnemonicContainerMnemonic}
        className="flex justify-center items-center w-full border border-vega-dark-200 rounded-md p-6 text-left overflow-y-auto overflow-x-auto w-full scrollbar-hide"
      >
        {hiddenInformation}
      </code>
      <div className="text-vega-dark-300 flex justify-between">
        <CopyWithCheckmark text={hiddenInformation} iconSide="left">
          Copy to clipboard
        </CopyWithCheckmark>
        <button
          onClick={() => {
            setShowInformation(false);
            onChange?.(false);
          }}
          className="flex justify-between items-center"
        >
          <Hide />
          <span className="ml-3">Hide</span>
        </button>
      </div>
    </div>
  ) : (
    <button
      autoFocus
      data-testid={locators.mnemonicContainerHidden}
      onClick={() => {
        setShowInformation(true);
        onChange?.(true);
      }}
      className="flex justify-center items-center w-full border border-vega-dark-200 rounded-md p-6"
    >
      <div className="flex flex-col items-center">
        <Show />
        {text}
      </div>
    </button>
  );
};
