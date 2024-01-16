export const TeamAvatar = ({ imgUrl }: { imgUrl: string }) => {
  // TODO: add fallback avatars
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt="Team avatar"
      className="rounded-full w-20 h-20 lg:w-[112px] lg:h-[112px] bg-vega-clight-700 dark:bg-vega-cdark-700 shrink-0"
      referrerPolicy="no-referrer"
    />
  );
};
