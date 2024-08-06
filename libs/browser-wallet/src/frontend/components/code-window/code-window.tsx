import type { ReactNode } from 'react';

import { CopyWithCheckmark } from '../copy-with-check';
import locators from '../locators';

export const CodeWindow = ({
  content,
  text,
}: {
  content: ReactNode;
  text: string;
}) => {
  return (
    <div
      data-testid={locators.codeWindow}
      className="whitespace-pre max-h-60 flex p-4 rounded-md w-full bg-vega-dark-150"
    >
      <code
        data-testid={locators.codeWindowContent}
        className="text-left overflow-y-auto overflow-x-auto w-full scrollbar-hide"
      >
        {content}
      </code>
      <CopyWithCheckmark text={text} />
    </div>
  );
};
