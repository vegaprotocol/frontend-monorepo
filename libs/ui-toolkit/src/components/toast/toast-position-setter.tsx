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
  const iconCssClasses = 'absolute top-[4px] left-[4px]';
  const buttonCssClasses =
    'relative border-none bg-neutral-500/20 dark:bg-neutral-500/40';
  const activeButton = 'bg-neutral-800/80 dark:bg-neutral-200/40';
  const activeIcon = 'fill-white dark:fill-black';
  return (
    <div className="flex justify-between py-3 items-center">
      <span>{t('Toast location')}</span>
      <div
        className={classNames(
          'grid grid-cols-3 grid-rows-2 w-[64px] h-[42px] gap-[2px]'
        )}
      >
        <Button
          className={classNames(
            buttonCssClasses,
            position === ToastPosition.TopLeft && activeButton
          )}
          onClick={() => handleChange(ToastPosition.TopLeft)}
          size="xs"
        >
          <Icon
            className={classNames(
              iconCssClasses,
              position === ToastPosition.TopLeft && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_TOP_LEFT}
          />{' '}
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === ToastPosition.TopCenter && activeButton
          )}
          onClick={() => handleChange(ToastPosition.TopCenter)}
          size="xs"
        >
          <Icon
            className={classNames(
              iconCssClasses,
              position === ToastPosition.TopCenter && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_UP}
          />
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === ToastPosition.TopRight && activeButton
          )}
          onClick={() => handleChange(ToastPosition.TopRight)}
          size="xs"
        >
          <Icon
            className={classNames(
              iconCssClasses,
              position === ToastPosition.TopRight && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_TOP_RIGHT}
          />
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === ToastPosition.BottomLeft && activeButton
          )}
          onClick={() => handleChange(ToastPosition.BottomLeft)}
          size="xs"
        >
          <Icon
            className={classNames(
              iconCssClasses,
              position === ToastPosition.BottomLeft && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_BOTTOM_LEFT}
          />
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === ToastPosition.BottomCenter && activeButton
          )}
          onClick={() => handleChange(ToastPosition.BottomCenter)}
          size="xs"
        >
          <Icon
            className={classNames(
              iconCssClasses,
              position === ToastPosition.BottomCenter && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_DOWN}
          />
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === ToastPosition.BottomRight && activeButton
          )}
          onClick={() => handleChange(ToastPosition.BottomRight)}
          size="xs"
        >
          <Icon
            className={classNames(
              iconCssClasses,
              position === ToastPosition.BottomRight && activeIcon
            )}
            size={3}
            name={IconNames.ARROW_BOTTOM_RIGHT}
          />
        </Button>
      </div>
    </div>
  );
};
