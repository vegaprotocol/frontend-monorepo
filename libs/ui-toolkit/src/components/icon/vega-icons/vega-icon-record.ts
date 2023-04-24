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
};
