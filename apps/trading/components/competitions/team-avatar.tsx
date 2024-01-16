import classNames from 'classnames';

export const TeamAvatar = ({
  imgUrl,
  size = 'large',
}: {
  imgUrl: string;
  size?: 'large' | 'small';
}) => {
  // TODO: add fallback avatars
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt="Team avatar"
      className={classNames(
        'rounded-full bg-vega-clight-700 dark:bg-vega-cdark-700 shrink-0',
        {
          'w-20 h-20 lg:w-[112px] lg:h-[112px]': size === 'large',
          'w-10 h-10': size === 'small',
        }
      )}
      referrerPolicy="no-referrer"
    />
  );
};
