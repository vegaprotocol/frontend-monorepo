import Highlighter from 'react-syntax-highlighter';

export const SyntaxHighlighter = ({ data }: { data: unknown }) => {
  return (
    <div className="sh-wrapper">
      <Highlighter language="json" useInlineStyles={false}>
        {JSON.stringify(data, null, '  ')}
      </Highlighter>
    </div>
  );
};
