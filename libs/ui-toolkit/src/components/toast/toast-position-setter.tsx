import classNames from 'classnames';
import { IconNames } from '@blueprintjs/icons';
import { Icon } from '../icon';
import { ToastPosition, useToastsConfiguration, useToasts } from './use-toasts';
import { useCallback } from 'react';
import { Intent } from '../../utils/intent';
import { useT } from '../../use-t';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';

export const ToastPositionSetter = () => {
  const t = useT();
  const setPosition = useToastsConfiguration((store) => store.setPosition);
  const position = useToastsConfiguration((store) => store.position);
  const setToast = useToasts((store) => store.setToast);
  const handleChange = useCallback(
    (position: ToastPosition) => {
      setPosition(position);
      setToast({
        id: 'test-toast',
        intent: Intent.Primary,
        content: <>{t('This is an example of a toast notification')}</>,
        onClose: () => useToasts.getState().remove('test-toast'),
      });
    },
    [setToast, setPosition, t]
  );
  const buttonCssClasses =
    'flex items-center px-1 py-1 relative rounded bg-gs-400 ';
  const activeIcon = 'fill-gs-900';

  const { screenSize } = useScreenDimensions();

  const isMobileScreen = screenSize === 'xs';

  if (isMobileScreen) {
    return (
      <div className="flex justify-between">
        <div className={classNames('grid grid-cols-1 grid-rows-2 gap-1')}>
          <button
            className={buttonCssClasses}
            onClick={() => handleChange(ToastPosition.TopCenter)}
          >
            <Icon
              className={classNames(
                position === ToastPosition.TopCenter && activeIcon
              )}
              size={3}
              name={IconNames.ARROW_UP}
            />
          </button>
          <button
            className={buttonCssClasses}
            onClick={() => handleChange(ToastPosition.BottomCenter)}
          >
            <Icon
              className={classNames(
                position === ToastPosition.BottomCenter && activeIcon
              )}
              size={3}
              name={IconNames.ARROW_DOWN}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <div className={classNames('grid grid-cols-3 grid-rows-2 gap-1')}>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.TopLeft)}
        >
          <Icon
            className={classNames(
              position === ToastPosition.TopLeft && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_TOP_LEFT}
          />{' '}
        </button>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.TopCenter)}
        >
          <Icon
            className={classNames(
              position === ToastPosition.TopCenter && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_UP}
          />
        </button>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.TopRight)}
        >
          <Icon
            className={classNames(
              position === ToastPosition.TopRight && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_TOP_RIGHT}
          />
        </button>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.BottomLeft)}
        >
          <Icon
            className={classNames(
              position === ToastPosition.BottomLeft && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_BOTTOM_LEFT}
          />
        </button>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.BottomCenter)}
        >
          <Icon
            className={classNames(
              position === ToastPosition.BottomCenter && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_DOWN}
          />
        </button>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.BottomRight)}
        >
          <Icon
            className={classNames(
              position === ToastPosition.BottomRight && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_BOTTOM_RIGHT}
          />
        </button>
      </div>
    </div>
  );
};
