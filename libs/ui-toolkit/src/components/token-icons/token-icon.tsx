import classNames from 'classnames';
import { TokenIconMap } from './token-icon-record';

interface TokenIconProps {
  address: string;
  size?: number;
}

export const TokenIcon = ({ address, size = 28 }: TokenIconProps) => {
  const Element = TokenIconMap[address];
  return (
    <span className={classNames('inline-block', 'align-text-bottom')}>
      {Element ? (
        <Element size={size} />
      ) : (
        <span
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-full bg-vega-clight-500 dark:bg-vega-cdark-500"
        >
          <span className="block text-[9px] font-mono leading-[0.9]">
            ERC
            <br />
            20
          </span>
        </span>
      )}
    </span>
  );
};
