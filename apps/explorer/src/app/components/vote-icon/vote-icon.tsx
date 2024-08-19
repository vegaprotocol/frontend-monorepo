import { Icon } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@vegaprotocol/ui-toolkit';

export interface VoteIconProps {
  // True is a yes vote, false is undefined or no vorte
  vote: boolean;
  // Defaults to 'For', but can be any text
  yesText?: string;
  // Defaults to 'Against', but can be any text
  noText?: string;
  // If set to false the background will not be coloured
  useVoteColour?: boolean;
}

function getBgColour(useVoteColour: boolean, vote: boolean) {
  if (useVoteColour === false) {
    return 'bg-surface-3';
  }

  return vote ? 'bg-green-550' : 'bg-pink-550';
}

function getFillColour(useVoteColour: boolean, vote: boolean) {
  if (useVoteColour === false) {
    return 'white';
  }

  return vote ? 'green-300' : 'pink-300';
}

function getTextColour(useVoteColour: boolean, vote: boolean) {
  if (useVoteColour === false) {
    return 'white';
  }

  return vote ? 'green-200' : 'pink-200';
}

/**
 * Displays a lozenge with an icon representing the way a user voted for a proposal.
 * The yes and no text can be overridden
 *
 * @returns
 */
export function VoteIcon({
  vote,
  useVoteColour = true,
  yesText = 'For',
  noText = 'Against',
}: VoteIconProps) {
  const label = vote ? yesText : noText;
  const icon: IconName = vote ? 'tick-circle' : 'delete';
  const bg = getBgColour(useVoteColour, vote);
  const fill = getFillColour(useVoteColour, vote);
  const text = getTextColour(useVoteColour, vote);

  return (
    <div
      className={`voteicon inline-block py-0 px-2 py rounded-md text-white whitespace-nowrap leading-tight sm align-top ${bg}`}
    >
      <Icon
        name={icon}
        size={3}
        className={`mr-2 p-0 mb-[-1px] fill-${fill}`}
      />
      <span className={`text-${text}`} data-testid="label">
        {label}
      </span>
    </div>
  );
}
