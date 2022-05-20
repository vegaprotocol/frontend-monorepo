import { useAppState } from '../../contexts/app-state/app-state-context';
import { Error } from '../icons';

export const AppBanner = () => {
  const {
    appState: { bannerMessage },
  } = useAppState();

  // Return empty div so that grid placement remains correct
  if (!bannerMessage) return <div />;

  return (
    <div className="bg-white p-8 text-black" role="alert">
      <p>
        <span className="inline-block relative top-[1px] text-intent-danger text-ui mr-[5px]">
          <Error />
        </span>
        {bannerMessage}
      </p>
    </div>
  );
};
