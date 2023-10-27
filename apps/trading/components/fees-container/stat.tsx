import classNames from 'classnames';

export const Stat = ({
  value,
  text,
  highlight,
}: {
  value: string | number;
  text?: string;
  highlight?: boolean;
}) => {
  return (
    <p className="pt-3 leading-none first:pt-6">
      <span
        className={classNames('inline-block text-3xl leading-none', {
          'text-transparent bg-rainbow bg-clip-text': highlight,
        })}
      >
        {value}
      </span>
      {text && (
        <small className="block mt-0.5 text-xs text-muted">{text}</small>
      )}
    </p>
  );
};
