export const Fallback = (props: { size: number }) => {
  return (
    <span
      className="inline-block rounded-full bg-surface-2"
      title="Fallback icon"
      style={{ width: props.size, height: props.size }}
    />
  );
};
