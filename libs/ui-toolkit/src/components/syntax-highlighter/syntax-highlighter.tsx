import { cn } from '../../utils/cn';
import { useMemo } from 'react';
import Highlighter from 'react-syntax-highlighter';

export const SyntaxHighlighter = ({
  data,
  size = 'default',
}: {
  data: unknown;
  size?: 'smaller' | 'default';
}) => {
  const parsedData = useMemo(() => {
    try {
      return JSON.stringify(data, null, '  ');
    } catch (e) {
      return 'Unable to parse data';
    }
  }, [data]);
  return (
    <div
      className={cn('syntax-highlighter-wrapper', {
        'syntax-highlighter-wrapper-sm': size === 'smaller',
      })}
    >
      <Highlighter language="json" useInlineStyles={false}>
        {parsedData}
      </Highlighter>
    </div>
  );
};
