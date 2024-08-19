export interface ProgressBarProps {
  value: number;
}

export const HighlightProgressBar = ({ value }: ProgressBarProps) => {
  const percent = value == null ? undefined : 100 * clamp(value, 0, 1);
  // don't set width if value is null (rely on default CSS value)
  const width = percent == null ? undefined : percent + '%';

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percent == null ? undefined : Math.round(percent)}
      role="progressbar"
      className="relative h-2 bg-gs-500 rounded-full overflow-hidden"
    >
      <div
        className="rounded-full bg-gradient-to-r from-[#4e05cf] to-pink h-full absolute transition-[width] ease-in-out"
        style={{ width }}
      />
    </div>
  );
};

function clamp(val: number, min: number, max: number) {
  if (val == null) {
    return val;
  }
  if (max < min) {
    throw new Error('clamp: max cannot be less than min');
  }
  return Math.min(Math.max(val, min), max);
}
