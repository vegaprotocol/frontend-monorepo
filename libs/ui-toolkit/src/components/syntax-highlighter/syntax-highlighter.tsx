import Highlighter from 'react-syntax-highlighter';

export const SyntaxHighlighter = ({ data }: { data: unknown }) => {
  return (
    <Highlighter language="json" useInlineStyles={false} className="vega-hl">
      {JSON.stringify(data, null, '  ')}
    </Highlighter>
  );
};
