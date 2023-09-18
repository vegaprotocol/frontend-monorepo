import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { RainbowButton } from './buttons';
import { AnimatedDudeWithWire } from './graphics/dude';
import { LayoutWithSky } from './layout';

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';

  const code = isRouteErrorResponse(error) ? error.status : 0;

  const messages: Record<number, string> = {
    0: 'An unknown error occurred.',
    404: "The page you're looking for doesn't exists.",
  };

  return (
    <LayoutWithSky className="pt-32">
      <div
        aria-hidden
        className="absolute top-64 right-[220px] md:right-[340px] max-sm:hidden"
      >
        <AnimatedDudeWithWire className="animate-spin" />
      </div>
      <h1 className="text-6xl font-alpha calt mb-10">{title}</h1>

      {Object.keys(messages).includes(code.toString()) ? (
        <p className="text-lg mb-10">{messages[code]}</p>
      ) : null}

      <p className="text-lg mb-10">
        <RainbowButton
          onClick={() => navigate('..')}
          variant="border"
          className="text-xs"
        >
          Go back and try again
        </RainbowButton>
      </p>
    </LayoutWithSky>
  );
};
