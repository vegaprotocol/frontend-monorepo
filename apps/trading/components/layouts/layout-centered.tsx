import { cn } from '@vegaprotocol/ui-toolkit';
import { Outlet } from 'react-router-dom';

export const SKY_BACKGROUND =
  'bg-[url(/sky-light.png)] dark:bg-[url(/sky-dark.png)] bg-[37%_0px] bg-[length:1440px] bg-no-repeat bg-local';

export const LayoutCentered = ({
  variant,
}: {
  variant?: 'sky' | 'gradient';
}) => {
  return (
    <div
      className={cn('overflow-y-auto h-full relative', {
        [SKY_BACKGROUND]: variant === 'sky',
      })}
    >
      {variant === 'gradient' && (
        <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
          <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-gs-900 to-transparent from-20% to-60%" />
        </div>
      )}
      <div className="flex flex-col gap-6 container min-h-full max-w-screen-xl mx-auto py-12 px-4">
        <Outlet />
      </div>
    </div>
  );
};
