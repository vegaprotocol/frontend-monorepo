import { isValidUrl } from '@vegaprotocol/utils';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

const NUM_AVATARS = 20;
const AVATAR_PATHNAME_PATTERN = '/team-avatars/{id}.png';

export const getFallbackAvatar = (teamId: string) => {
  const avatarId = ((parseInt(teamId, 16) % NUM_AVATARS) + 1)
    .toString()
    .padStart(2, '0'); // between 01 - 20

  return AVATAR_PATHNAME_PATTERN.replace('{id}', avatarId);
};

const useAvatar = (teamId: string, url: string) => {
  const fallback = getFallbackAvatar(teamId);
  const [avatar, setAvatar] = useState<string>(fallback);

  useEffect(() => {
    if (!isValidUrl(url)) return;
    fetch(url, { cache: 'force-cache' })
      .then((response) => {
        if (response.ok) {
          setAvatar(url);
        }
      })
      .catch(() => {
        /** noop */
      });
  });

  return avatar;
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
  const img = useAvatar(teamId, imgUrl);
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
