export type HashProps = React.HTMLProps<HTMLSpanElement> & {
  text: string;
  truncate?: boolean;
};

/**
 * A simple component that ensures long text things like hashes
 * are broken when they need to wrap. This will remove the need
 * for a lot of the overflow scrolling that currently exists.
 */
const Hash = ({ className, text, truncate = false }: HashProps) => {
  const h = truncate ? text.slice(0, 6) : text;

  return (
    <code
      title={text}
      className={`break-all font-mono ${className}`}
      style={{ wordWrap: 'break-word' }}
    >
      {h}
    </code>
  );
};

export default Hash;
