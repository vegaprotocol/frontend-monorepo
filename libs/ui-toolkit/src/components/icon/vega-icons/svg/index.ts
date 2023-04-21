import IconBreakdown from './icon-breakdown.svg';
import IconCopy from './icon-copy.svg';
import IconDeposit from './icon-deposit.svg';
import IconWithdraw from './icon-withdraw.svg';
import IconTransfer from './icon-transfer.svg';
import IconEdit from './icon-edit.svg';
import IconMoon from './icon-moon.svg';
import IconGlobe from './icon-globe.svg';
import IconLinkedIn from './icon-linkedin.svg';
import IconTwitter from './icon-twitter.svg';
import IconQuestionMark from './icon-question-mark.svg';
import IconForum from './icon-forum.svg';
import IconOpenExternal from './icon-open-external.svg';

export type {
  IconBreakdown,
  IconCopy,
  IconDeposit,
  IconWithdraw,
  IconTransfer,
  IconEdit,
  IconMoon,
  IconGlobe,
  IconLinkedIn,
  IconTwitter,
  IconQuestionMark,
};

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

export const VegaIconNameMap: Record<VegaIconNames, string> = {
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
