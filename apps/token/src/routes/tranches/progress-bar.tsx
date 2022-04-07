interface ProgressBarProps {
  width: number;
  percentage: number;
  color: string;
}

export const ProgressBar = ({ width, color, percentage }: ProgressBarProps) => {
  return (
    <div
      style={{
        position: "relative",
        width,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          width: percentage + "%",
        }}
      />
    </div>
  );
};
