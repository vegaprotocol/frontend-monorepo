import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import { IconNames } from '@blueprintjs/icons';
import { Icon } from '../icon';
import { Button } from '../button';
import { ToastPosition, useToastsConfiguration, useToasts } from './use-toasts';
import { useCallback } from 'react';
import { Intent } from '../../utils/intent';

const TEST_TOAST = {
  id: 'test-toast',
  intent: Intent.Primary,
  content: <>{t('This is an example of a toast notification')}</>,
  onClose: () => useToasts.getState().remove('test-toast'),
};

export const ToastPositionSetter = () => {
  const setPostion = useToastsConfiguration((store) => store.setPosition);
  const position = useToastsConfiguration((store) => store.position);
  const setToast = useToasts((store) => store.setToast);
  const handleChange = useCallback(
    (position: ToastPosition) => {
      setPostion(position);
      setToast(TEST_TOAST);
    },
    [setToast, setPostion]
  );
  // const iconCssClasses = 'absolute top-[4px] left-[4px]';
  const iconCssClasses = '';
  const buttonCssClasses =
    'flex items-center px-1 py-1 relative rounded bg-vega-clight-400 dark:bg-vega-cdark-400';
  const activeIcon = 'fill-vega-clight-900 dark:fill-vega-cdark-900';
  return (
    <div className="flex justify-between">
      <div className={classNames('grid grid-cols-3 grid-rows-2 gap-1')}>
        <button
          className={buttonCssClasses}
          onClick={() => handleChange(ToastPosition.TopLeft)}
        >
          <Icon
            className={classNames(
              iconCssClasses,
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
              iconCssClasses,
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
              iconCssClasses,
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
              iconCssClasses,
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
              iconCssClasses,
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
              iconCssClasses,
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
