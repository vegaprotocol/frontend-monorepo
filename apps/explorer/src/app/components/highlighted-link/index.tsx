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
    <Link
      className="font-bold underline dark:text-vega-yellow dark:font-normal dark:no-underline"
      to={to}
      {...props}
    >
      {text}
    </Link>
  );
};
