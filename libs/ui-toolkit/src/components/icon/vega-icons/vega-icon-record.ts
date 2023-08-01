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
import { IconExclaimationMark } from './svg-icons/icon-exclaimation-mark';
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
import { IconStar } from './svg-icons/icon-star';
import { IconTick } from './svg-icons/icon-tick';
import { IconTicket } from './svg-icons/icon-ticket';
import { IconTransfer } from './svg-icons/icon-transfer';
import { IconTrendUp } from './svg-icons/icon-trend-up';
import { IconTrendDown } from './svg-icons/icon-trend-down';
import { IconTwitter } from './svg-icons/icon-twitter';
import { IconVote } from './svg-icons/icon-vote';
import { IconWithdraw } from './svg-icons/icon-withdraw';
import { IconSearch } from './svg-icons/icon-search';

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
  EXCLAIMATION_MARK = 'exclaimation-mark',
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
  SEARCH = 'search',
  STAR = 'star',
  TICK = 'tick',
  TICKET = 'ticket',
  TRANSFER = 'transfer',
  TREND_UP = 'trend-up',
  TREND_DOWN = 'trend-down',
  TWITTER = 'twitter',
  VOTE = 'vote',
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
  'exclaimation-mark': IconExclaimationMark,
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
  search: IconSearch,
  star: IconStar,
  tick: IconTick,
  ticket: IconTicket,
  transfer: IconTransfer,
  'trend-up': IconTrendUp,
  'trend-down': IconTrendDown,
  twitter: IconTwitter,
  vote: IconVote,
  withdraw: IconWithdraw,
};
