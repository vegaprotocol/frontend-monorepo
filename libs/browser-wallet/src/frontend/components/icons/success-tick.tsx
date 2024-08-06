const PixelatedTick = () => {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
      <path d="M4 16H0V20H4V16Z" fill="#161616" />
      <path d="M8 20H4V24H8V20Z" fill="#161616" />
      <path d="M12 24H8V28H12V24Z" fill="#161616" />
      <path d="M16 20H12V24H16V20Z" fill="#161616" />
      <path d="M20 16H16V20H20V16Z" fill="#161616" />
      <path d="M24 12H20V16H24V12Z" fill="#161616" />
      <path d="M28 8H24V12H28V8Z" fill="#161616" />
      <path d="M32 4H28V8H32V4Z" fill="#161616" />
      <path d="M36 0H32V4H36V0Z" fill="#161616" />
    </svg>
  );
};

export const SuccessTick = () => {
  return (
    <div className="rounded-md py-5 px-4 bg-vega-green-550 mb-8">
      <PixelatedTick />
    </div>
  );
};
