import Highlighter from 'react-syntax-highlighter';
import './syntax-highlighter.scss';

export const SyntaxHighlighter = ({ data }: { data: unknown }) => {
  return (
    <Highlighter language="json" useInlineStyles={false}>
      {JSON.stringify(data, null, '  ')}
    </Highlighter>
  );
};
