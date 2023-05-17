import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import { IconNames } from '@blueprintjs/icons';
import { Icon } from '../icon';
import { Button } from '../button';
import { useToasts } from './use-toasts';

export const ToastPositionSetter = () => {
  const setPostion = useToasts((store) => store.setPosition);
  const position = useToasts((store) => store.position);
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
          'grid grid-cols-2 grid-rows-2 w-[42px] h-[42px] gap-[2px]'
        )}
      >
        <Button
          className={classNames(
            buttonCssClasses,
            position === 2 && activeButton
          )}
          onClick={() => setPostion(2)}
          size="xs"
        >
          <Icon
            className={classNames(iconCssClasses, position === 2 && activeIcon)}
            size={3}
            name={IconNames.ARROW_TOP_LEFT}
          />{' '}
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === 3 && activeButton
          )}
          onClick={() => setPostion(3)}
          size="xs"
        >
          <Icon
            className={classNames(iconCssClasses, position === 3 && activeIcon)}
            size={3}
            name={IconNames.ARROW_TOP_RIGHT}
          />
        </Button>
        <Button
          className={classNames(
            buttonCssClasses,
            position === 1 && activeButton
          )}
          onClick={() => setPostion(1)}
          size="xs"
        >
          <Icon
            className={classNames(iconCssClasses, position === 1 && activeIcon)}
            size={3}
            name={IconNames.ARROW_BOTTOM_LEFT}
          />
        </Button>
        <Button
          className={classNames(buttonCssClasses, !position && activeButton)}
          onClick={() => setPostion(0)}
          size="xs"
        >
          <Icon
            className={classNames(iconCssClasses, !position && activeIcon)}
            size={3}
            name={IconNames.ARROW_BOTTOM_RIGHT}
          />
        </Button>
      </div>
    </div>
  );
};
