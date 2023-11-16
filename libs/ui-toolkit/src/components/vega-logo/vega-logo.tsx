type VegaLogoProps = {
  className?: string;
};
export const VegaLogo = ({ className }: VegaLogoProps) => {
  return (
    <svg
      aria-label="Vega"
      className={className || 'h-6'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 111 24"
    >
      <path
        fill="currentColor"
        d="M10.371 20.794 17.183.02h3.42l-8.436 23.965H8.471L0 .02h3.48l6.891 20.774ZM34.994 13.019v8.249h13.382v2.716H31.782V.019h16.3v2.715H34.994v7.577h11.658v2.708H34.994ZM61.25 2.92h2.88v18.195h-2.88V2.92ZM75.653 0v2.92H64.129V0h11.525ZM64.129 24v-2.885h11.525V24H64.129Zm14.405-2.885h-2.88v-5.77h-5.762v-2.89h8.642v8.66Zm0-18.195v2.884h-2.88V2.92h2.88ZM110.71 23.984h-3.354l-1.763-4.826h-12.03L91.8 23.984h-3.279L97.807.019h3.626l9.277 23.965ZM99.528 2.904l-4.949 13.544h10.002L99.597 2.903h-.07Z"
      ></path>
    </svg>
  );
};

export const VLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-label="Vega"
      width="29"
      height="34"
      fill="currentColor"
      viewBox="0 0 29 34"
      className={className}
    >
      <path d="M14.5003 29.1426H9.6665V34.0001H14.5003V29.1426Z" />
      <path d="M19.3343 24.2859H14.5005V29.1434H19.3343V24.2859Z" />
      <path d="M29.0008 19.4282H24.167V24.2857H29.0008V19.4282Z" />
      <path d="M24.1673 0H19.3335V19.4283H24.1673V0Z" />
      <path d="M9.66776 24.2859H4.83398V29.1434H9.66776V24.2859Z" />
      <path d="M4.83378 0H0V24.2858H4.83378V0Z" />
    </svg>
  );
};
