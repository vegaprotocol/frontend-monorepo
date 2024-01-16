import classNames from 'classnames';

const NUM_AVATARS = 20;
const AVATAR_PATHNAME_PATTERN = '/team-avatars/{id}.png';

const getFallbackAvatar = (teamId: string) => {
  const avatarId = ((parseInt(teamId, 16) % NUM_AVATARS) + 1)
    .toString()
    .padStart(2, '0'); // between 01 - 20

  return AVATAR_PATHNAME_PATTERN.replace('{id}', avatarId);
};

export const TeamAvatar = ({
  teamId,
  imgUrl,
  alt,
  size = 'large',
}: {
  teamId: string;
  imgUrl: string;
  alt?: string;
  size?: 'large' | 'small';
}) => {
  const img = imgUrl && imgUrl.length > 0 ? imgUrl : getFallbackAvatar(teamId);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt={alt || 'Team avatar'}
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
