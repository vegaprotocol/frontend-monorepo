import { IconBreakdown } from './svg-icons/icon-breakdown';
import { IconCopy } from './svg-icons/icon-copy';
import { IconDeposit } from './svg-icons/icon-deposit';
import { IconWithdraw } from './svg-icons/icon-withdraw';
import { IconTransfer } from './svg-icons/icon-transfer';
import { IconEdit } from './svg-icons/icon-edit';
import { IconMoon } from './svg-icons/icon-moon';
import { IconGlobe } from './svg-icons/icon-globe';
import { IconLinkedIn } from './svg-icons/icon-linkedin';
import { IconTwitter } from './svg-icons/icon-twitter';
import { IconQuestionMark } from './svg-icons/icon-question-mark';
import { IconForum } from './svg-icons/icon-forum';
import { IconOpenExternal } from './svg-icons/icon-open-external';
import { IconArrowRight } from './svg-icons/icon-arrow-right';
import { IconChevronUp } from './svg-icons/icon-chevron-up';
import { IconTrendUp } from './svg-icons/icon-trend-up';
import { IconCross } from './svg-icons/icon-cross';
import { IconKebab } from './svg-icons/icon-kebab';
import { IconArrowDown } from './svg-icons/icon-arrow-down';
import { IconChevronDown } from './svg-icons/icon-chevron-down';
import { IconTick } from './svg-icons/icon-tick';

export enum VegaIconNames {
  BREAKDOWN = 'breakdown',
  COPY = 'copy',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  EDIT = 'edit',
  TRANSFER = 'transfer',
  FORUM = 'forum',
  GLOBE = 'globe',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  MOON = 'moon',
  OPEN_EXTERNAL = 'open-external',
  QUESTION_MARK = 'question-mark',
  ARROW_RIGHT = 'arrow-right',
  ARROW_DOWN = 'arrow-down',
  CHEVRON_UP = 'chevron-up',
  CHEVRON_DOWN = 'chevron-down',
  TREND_UP = 'trend-up',
  CROSS = 'cross',
  KEBAB = 'kebab',
  TICK = 'tick',
}

export const VegaIconNameMap: Record<
  VegaIconNames,
  ({ size }: { size: number }) => JSX.Element
> = {
  breakdown: IconBreakdown,
  copy: IconCopy,
  deposit: IconDeposit,
  withdraw: IconWithdraw,
  transfer: IconTransfer,
  edit: IconEdit,
  moon: IconMoon,
  globe: IconGlobe,
  linkedin: IconLinkedIn,
  twitter: IconTwitter,
  'question-mark': IconQuestionMark,
  forum: IconForum,
  'open-external': IconOpenExternal,
  'arrow-right': IconArrowRight,
  'arrow-down': IconArrowDown,
  'chevron-up': IconChevronUp,
  'chevron-down': IconChevronDown,
  'trend-up': IconTrendUp,
  cross: IconCross,
  kebab: IconKebab,
  tick: IconTick,
};
