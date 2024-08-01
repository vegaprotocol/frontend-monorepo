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
import { IconClock } from './svg-icons/icon-clock';
import { IconCog } from './svg-icons/icon-cog';
import { IconCopy } from './svg-icons/icon-copy';
import { IconCross } from './svg-icons/icon-cross';
import { IconDeposit } from './svg-icons/icon-deposit';
import { IconEdit } from './svg-icons/icon-edit';
import { IconExclamationMark } from './svg-icons/icon-exclamation-mark';
import { IconExclamationSign } from './svg-icons/icon-exclamation-sign';
import { IconEye } from './svg-icons/icon-eye';
import { IconEyeOff } from './svg-icons/icon-eye-off';
import { IconForum } from './svg-icons/icon-forum';
import { IconGlobe } from './svg-icons/icon-globe';
import { IconInfo } from './svg-icons/icon-info';
import { IconKebab } from './svg-icons/icon-kebab';
import { IconLinkedIn } from './svg-icons/icon-linkedin';
import { IconLoading } from './svg-icons/icon-loading';
import { IconLock } from './svg-icons/icon-lock';
import { IconMedal } from './svg-icons/icon-medal';
import { IconMetaMask } from './svg-icons/icon-metamask';
import { IconMinus } from './svg-icons/icon-minus';
import { IconMoon } from './svg-icons/icon-moon';
import { IconOpenExternal } from './svg-icons/icon-open-external';
import { IconPlus } from './svg-icons/icon-plus';
import { IconQuestionMark } from './svg-icons/icon-question-mark';
import { IconSearch } from './svg-icons/icon-search';
import { IconSlimTick } from './svg-icons/icon-slim-tick';
import { IconStar } from './svg-icons/icon-star';
import { IconSun } from './svg-icons/icon-sun';
import { IconSwap } from './svg-icons/icon-swap';
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
import { IconHammer } from './svg-icons/icon-hammer';
import { IconMonitor } from './svg-icons/icon-monitor';
import { IconPause } from './svg-icons/icon-pause';
import { IconClosed } from './svg-icons/icon-closed';
import { IconLong } from './svg-icons/icon-long';
import { IconShort } from './svg-icons/icon-short';

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
  CLOCK = 'clock',
  COG = 'cog',
  COPY = 'copy',
  CROSS = 'cross',
  DEPOSIT = 'deposit',
  EDIT = 'edit',
  EXCLAMATION_MARK = 'exclamation-mark',
  EXCLAMATION_SIGN = 'exclamation-sign',
  EYE = 'eye',
  EYE_OFF = 'eye-off',
  FORUM = 'forum',
  GLOBE = 'globe',
  INFO = 'info',
  KEBAB = 'kebab',
  LINKEDIN = 'linkedin',
  LOADING = 'loading',
  LOCK = 'lock',
  LONG = 'long',
  MEDAL = 'medal',
  METAMASK = 'metamask',
  MINUS = 'minus',
  MOON = 'moon',
  OPEN_EXTERNAL = 'open-external',
  PLUS = 'plus',
  QUESTION_MARK = 'question-mark',
  SEARCH = 'search',
  SHORT = 'short',
  SLIM_TICK = 'slim-tick',
  STAR = 'star',
  STREAK = 'streak',
  SUN = 'sun',
  SWAP = 'swap',
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
  MONITOR = 'monitor',
  HAMMER = 'hammer',
  PAUSE = 'pause',
  CLOSED = 'closed',
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
  'exclamation-sign': IconExclamationSign,
  'open-external': IconOpenExternal,
  'question-mark': IconQuestionMark,
  'trend-down': IconTrendDown,
  'trend-up': IconTrendUp,
  breakdown: IconBreakdown,
  bullet: IconBullet,
  clock: IconClock,
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
  loading: IconLoading,
  lock: IconLock,
  long: IconLong,
  medal: IconMedal,
  metamask: IconMetaMask,
  minus: IconMinus,
  moon: IconMoon,
  plus: IconPlus,
  search: IconSearch,
  'slim-tick': IconSlimTick,
  star: IconStar,
  sun: IconSun,
  swap: IconSwap,
  tick: IconTick,
  ticket: IconTicket,
  transfer: IconTransfer,
  twitter: IconTwitter,
  vote: IconVote,
  withdraw: IconWithdraw,
  warning: IconWarning,
  man: IconMan,
  team: IconTeam,
  short: IconShort,
  streak: IconStreak,
  hammer: IconHammer,
  monitor: IconMonitor,
  pause: IconPause,
  closed: IconClosed,
};
