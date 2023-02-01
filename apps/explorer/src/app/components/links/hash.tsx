export type HashProps = {
  text: string;
};

/**
 * A simple component that ensures long text things like hashes
 * are broken when they need to wrap. This will remove the need
 * for a lot of the overflow scrolling that currently exists.
 */
const Hash = ({ text }: HashProps) => {
  return (
    <code className="break-all font-mono" style={{ wordWrap: 'break-word' }}>
      {text}
    </code>
  );
};

export default Hash;
