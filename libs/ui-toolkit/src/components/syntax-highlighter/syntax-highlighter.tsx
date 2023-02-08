import classNames from 'classnames';
import Highlighter from 'react-syntax-highlighter';

export const SyntaxHighlighter = ({
  data,
  size = 'default',
}: {
  data: unknown;
  size?: 'smaller' | 'default';
}) => {
  return (
    <div
      className={classNames('syntax-highlighter-wrapper', {
        'syntax-highlighter-wrapper-sm': size === 'smaller',
      })}
    >
      <Highlighter language="json" useInlineStyles={false}>
        {JSON.stringify(data, null, '  ')}
      </Highlighter>
    </div>
  );
};
