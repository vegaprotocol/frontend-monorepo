import { Link } from 'react-router-dom';

interface HighlightedLinkProps {
  to: string;
  text: string | undefined;
}

export const HighlightedLink = ({
  to,
  text,
  ...props
}: HighlightedLinkProps) => {
  return (
    <Link className="text-vega-pink dark:text-vega-yellow" to={to} {...props}>
      {text}
    </Link>
  );
};
