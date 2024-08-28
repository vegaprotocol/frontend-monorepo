export const Backdrop = (props: { backdrop?: number }) => {
  if (props.backdrop !== undefined) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full -z-10 bg-cover bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(/backdrop-${props.backdrop}.jpg)` }}
      />
    );
  }

  return null;
};
