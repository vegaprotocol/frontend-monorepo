import { IconArrowDown } from './svg-icons/icon-arrow-down';
import { IconArrowUp } from './svg-icons/icon-arrow-up';
import { IconArrowRight } from './svg-icons/icon-arrow-right';
import { IconBreakdown } from './svg-icons/icon-breakdown';
import { IconBullet } from './svg-icons/icon-bullet';
import { IconChevronDown } from './svg-icons/icon-chevron-down';
import { IconChevronLeft } from './svg-icons/icon-chevron-left';
import { IconChevronUp } from './svg-icons/icon-chevron-up';
import { IconCog } from './svg-icons/icon-cog';
import { IconCopy } from './svg-icons/icon-copy';
import { IconCross } from './svg-icons/icon-cross';
import { IconDeposit } from './svg-icons/icon-deposit';
import { IconEdit } from './svg-icons/icon-edit';
import { IconForum } from './svg-icons/icon-forum';
import { IconGlobe } from './svg-icons/icon-globe';
import { IconInfo } from './svg-icons/icon-info';
import { IconKebab } from './svg-icons/icon-kebab';
import { IconLinkedIn } from './svg-icons/icon-linkedin';
import { IconMinus } from './svg-icons/icon-minus';
import { IconMoon } from './svg-icons/icon-moon';
import { IconOpenExternal } from './svg-icons/icon-open-external';
import { IconQuestionMark } from './svg-icons/icon-question-mark';
import { IconPlus } from './svg-icons/icon-plus';
import { IconTick } from './svg-icons/icon-tick';
import { IconTicket } from './svg-icons/icon-ticket';
import { IconTransfer } from './svg-icons/icon-transfer';
import { IconTrendUp } from './svg-icons/icon-trend-up';
import { IconTwitter } from './svg-icons/icon-twitter';
import { IconWithdraw } from './svg-icons/icon-withdraw';

export enum VegaIconNames {
  ARROW_DOWN = 'arrow-down',
  ARROW_UP = 'arrow-up',
  ARROW_RIGHT = 'arrow-right',
  BREAKDOWN = 'breakdown',
  BULLET = 'bullet',
  CHEVRON_DOWN = 'chevron-down',
  CHEVRON_LEFT = 'chevron-left',
  CHEVRON_UP = 'chevron-up',
  COG = 'cog',
  COPY = 'copy',
  CROSS = 'cross',
  DEPOSIT = 'deposit',
  EDIT = 'edit',
  FORUM = 'forum',
  GLOBE = 'globe',
  INFO = 'info',
  KEBAB = 'kebab',
  LINKEDIN = 'linkedin',
  MINUS = 'minus',
  MOON = 'moon',
  OPEN_EXTERNAL = 'open-external',
  QUESTION_MARK = 'question-mark',
  PLUS = 'plus',
  TICK = 'tick',
  TICKET = 'ticket',
  TRANSFER = 'transfer',
  TREND_UP = 'trend-up',
  TWITTER = 'twitter',
  WITHDRAW = 'withdraw',
}

export const VegaIconNameMap: Record<
  VegaIconNames,
  ({ size }: { size: number }) => JSX.Element
> = {
  'arrow-down': IconArrowDown,
  'arrow-up': IconArrowUp,
  'arrow-right': IconArrowRight,
  breakdown: IconBreakdown,
  bullet: IconBullet,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-up': IconChevronUp,
  cog: IconCog,
  copy: IconCopy,
  cross: IconCross,
  deposit: IconDeposit,
  edit: IconEdit,
  forum: IconForum,
  globe: IconGlobe,
  info: IconInfo,
  kebab: IconKebab,
  linkedin: IconLinkedIn,
  minus: IconMinus,
  moon: IconMoon,
  'open-external': IconOpenExternal,
  plus: IconPlus,
  'question-mark': IconQuestionMark,
  tick: IconTick,
  transfer: IconTransfer,
  'trend-up': IconTrendUp,
  twitter: IconTwitter,
  ticket: IconTicket,
  withdraw: IconWithdraw,
};
