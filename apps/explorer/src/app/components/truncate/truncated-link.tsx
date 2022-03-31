import { TruncateInline } from './truncate';
import { Link } from 'react-router-dom';

interface TruncatedLinkProps {
  to: string;
  text: string;
  startChars: number;
  endChars: number;
}

export const TruncatedLink = ({
  to,
  text,
  startChars,
  endChars,
}: TruncatedLinkProps) => {
  return (
    <Link to={to}>
      <TruncateInline
        text={text}
        startChars={startChars}
        endChars={endChars}
        className="font-mono text-vega-pink dark:text-vega-yellow"
      />
    </Link>
  );
};
