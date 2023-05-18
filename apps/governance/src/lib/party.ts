export const PARTY_NOT_FOUND = 'failed to get party for ID';

export const isPartyNotFoundError = (error: { message: string }) => {
  if (error.message.includes(PARTY_NOT_FOUND)) {
    return true;
  }
  return false;
};
