import { IconArrowDown } from './svg-icons/icon-arrow-down';
import { IconArrowLeft } from './svg-icons/icon-arrow-left';
import { IconArrowRight } from './svg-icons/icon-arrow-right';
import { IconArrowTopRight } from './svg-icons/icon-arrow-top-right';
import { IconArrowUp } from './svg-icons/icon-arrow-up';
import { IconBreakdown } from './svg-icons/icon-breakdown';
import { IconBullet } from './svg-icons/icon-bullet';
import { IconChevronDown } from './svg-icons/icon-chevron-down';
import { IconChevronLeft } from './svg-icons/icon-chevron-left';
import { IconChevronRight } from './svg-icons/icon-chevron-right';
import { IconChevronUp } from './svg-icons/icon-chevron-up';
import { IconCog } from './svg-icons/icon-cog';
import { IconCopy } from './svg-icons/icon-copy';
import { IconCross } from './svg-icons/icon-cross';
import { IconDeposit } from './svg-icons/icon-deposit';
import { IconEdit } from './svg-icons/icon-edit';
import { IconExclamationMark } from './svg-icons/icon-exclamation-mark';
import { IconEye } from './svg-icons/icon-eye';
import { IconEyeOff } from './svg-icons/icon-eye-off';
import { IconForum } from './svg-icons/icon-forum';
import { IconGlobe } from './svg-icons/icon-globe';
import { IconInfo } from './svg-icons/icon-info';
import { IconKebab } from './svg-icons/icon-kebab';
import { IconLinkedIn } from './svg-icons/icon-linkedin';
import { IconLock } from './svg-icons/icon-lock';
import { IconMetaMask } from './svg-icons/icon-metamask';
import { IconMinus } from './svg-icons/icon-minus';
import { IconMoon } from './svg-icons/icon-moon';
import { IconOpenExternal } from './svg-icons/icon-open-external';
import { IconPlus } from './svg-icons/icon-plus';
import { IconQuestionMark } from './svg-icons/icon-question-mark';
import { IconSearch } from './svg-icons/icon-search';
import { IconStar } from './svg-icons/icon-star';
import { IconSun } from './svg-icons/icon-sun';
import { IconTick } from './svg-icons/icon-tick';
import { IconTicket } from './svg-icons/icon-ticket';
import { IconTransfer } from './svg-icons/icon-transfer';
import { IconTrendDown } from './svg-icons/icon-trend-down';
import { IconTrendUp } from './svg-icons/icon-trend-up';
import { IconTwitter } from './svg-icons/icon-twitter';
import { IconVote } from './svg-icons/icon-vote';
import { IconWarning } from './svg-icons/icon-warning';
import { IconWithdraw } from './svg-icons/icon-withdraw';
import { IconMan } from './svg-icons/icon-man';
import { IconTeam } from './svg-icons/icon-team';
import { IconStreak } from './svg-icons/icon-streak';

export enum VegaIconNames {
  ARROW_DOWN = 'arrow-down',
  ARROW_LEFT = 'arrow-left',
  ARROW_RIGHT = 'arrow-right',
  ARROW_TOP_RIGHT = 'arrow-top-right',
  ARROW_UP = 'arrow-up',
  BREAKDOWN = 'breakdown',
  BULLET = 'bullet',
  CHEVRON_DOWN = 'chevron-down',
  CHEVRON_LEFT = 'chevron-left',
  CHEVRON_RIGHT = 'chevron-right',
  CHEVRON_UP = 'chevron-up',
  COG = 'cog',
  COPY = 'copy',
  CROSS = 'cross',
  DEPOSIT = 'deposit',
  EDIT = 'edit',
  EXCLAMATION_MARK = 'exclamation-mark',
  EYE = 'eye',
  EYE_OFF = 'eye-off',
  FORUM = 'forum',
  GLOBE = 'globe',
  INFO = 'info',
  KEBAB = 'kebab',
  LINKEDIN = 'linkedin',
  LOCK = 'lock',
  METAMASK = 'metamask',
  MINUS = 'minus',
  MOON = 'moon',
  OPEN_EXTERNAL = 'open-external',
  PLUS = 'plus',
  QUESTION_MARK = 'question-mark',
  SEARCH = 'search',
  STAR = 'star',
  STREAK = 'streak',
  SUN = 'sun',
  TICK = 'tick',
  TICKET = 'ticket',
  TRANSFER = 'transfer',
  TREND_DOWN = 'trend-down',
  TREND_UP = 'trend-up',
  TWITTER = 'twitter',
  VOTE = 'vote',
  WITHDRAW = 'withdraw',
  WARNING = 'warning',
  MAN = 'man',
  TEAM = 'team',
}

export const VegaIconNameMap: Record<
  VegaIconNames,
  ({ size }: { size: number }) => JSX.Element
> = {
  'arrow-down': IconArrowDown,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
  'arrow-top-right': IconArrowTopRight,
  'arrow-up': IconArrowUp,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  'chevron-up': IconChevronUp,
  'eye-off': IconEyeOff,
  'exclamation-mark': IconExclamationMark,
  'open-external': IconOpenExternal,
  'question-mark': IconQuestionMark,
  'trend-down': IconTrendDown,
  'trend-up': IconTrendUp,
  breakdown: IconBreakdown,
  bullet: IconBullet,
  cog: IconCog,
  copy: IconCopy,
  cross: IconCross,
  deposit: IconDeposit,
  edit: IconEdit,
  eye: IconEye,
  forum: IconForum,
  globe: IconGlobe,
  info: IconInfo,
  kebab: IconKebab,
  linkedin: IconLinkedIn,
  lock: IconLock,
  metamask: IconMetaMask,
  minus: IconMinus,
  moon: IconMoon,
  plus: IconPlus,
  search: IconSearch,
  star: IconStar,
  sun: IconSun,
  tick: IconTick,
  ticket: IconTicket,
  transfer: IconTransfer,
  twitter: IconTwitter,
  vote: IconVote,
  withdraw: IconWithdraw,
  warning: IconWarning,
  man: IconMan,
  team: IconTeam,
  streak: IconStreak,
};
