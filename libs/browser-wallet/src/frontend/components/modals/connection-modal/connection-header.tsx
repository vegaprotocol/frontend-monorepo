import { Header } from '../../header';
import { VegaIcon } from '../../icons/vega-icon';
import locators from '../../locators';

const LeftRightArrows = () => {
  return (
    <svg
      width="14"
      height="32"
      viewBox="0 0 14 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.62963 7.53L7.72486 12.6252L6.97533 13.3748L0.600565 7L6.97533 0.625231L7.72486 1.37476L2.62963 6.47L13.3501 6.47V7.53L2.62963 7.53Z"
        fill="#C0C0C0"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3704 24.47L6.27514 19.3748L7.02467 18.6252L13.3994 25L7.02467 31.3748L6.27514 30.6252L11.3704 25.53H0.649902V24.47H11.3704Z"
        fill="#C0C0C0"
      />
    </svg>
  );
};

export const ConnectionHeader = ({
  hostname,
  title,
}: {
  hostname: string;
  title: string;
}) => {
  return (
    <div data-testid={locators.modalHeader}>
      <div className="flex justify-center items-center">
        <div className="flex flex-col justify-center mx-4">
          <LeftRightArrows />
        </div>
        <VegaIcon color="black" backgroundColor="white" />
      </div>
      <div className="text-center mb-6 mt-8">
        <Header content={title} />
        <p
          data-testid={locators.dAppHostname}
          className="break-all text-neutral-light text-surface-0-fg-muted"
        >
          {hostname}
        </p>
      </div>
    </div>
  );
};
