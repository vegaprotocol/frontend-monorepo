import IconBreakdown from './svg/icon-breakdown.svg';
import IconCopy from './svg/icon-copy.svg';
import IconDeposit from './svg/icon-deposit.svg';
import IconWithdraw from './svg/icon-withdraw.svg';
import IconTransfer from './svg/icon-transfer.svg';
import IconEdit from './svg/icon-edit.svg';
import IconMoon from './svg/icon-moon.svg';
import IconGlobe from './svg/icon-globe.svg';
import IconLinkedIn from './svg/icon-linkedin.svg';
import IconTwitter from './svg/icon-twitter.svg';
import IconQuestionMark from './svg/icon-question-mark.svg';
import IconForum from './svg/icon-forum.svg';
import IconOpenExternal from './svg/icon-open-external.svg';

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
