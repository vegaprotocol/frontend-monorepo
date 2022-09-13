import { addHours, addMinutes, getTime } from 'date-fns';

export const getValidationTimestamp = (proposalValidationDeadline: number) => {
  return Math.floor(
    getTime(
      proposalValidationDeadline === 0
        ? addHours(
            addMinutes(new Date(Date.now()), 2),
            proposalValidationDeadline
          )
        : addHours(new Date(Date.now()), proposalValidationDeadline)
    ) / 1000
  );
};
