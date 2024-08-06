export const CONSTANTS = {
  width: 360,
  defaultHeight: 600,
};

export const PERMITTED_RECOVERY_PHRASE_LENGTH = [12, 15, 18, 21, 24];

export const AUTO_CONSENT_TRANSACTION_TYPES = [
  'orderSubmission',
  'orderCancellation',
  'orderAmendment',
  'stopOrdersSubmission',
  'stopOrdersCancellation',
  'voteSubmission',
  'updateMarginMode',
  'batchMarketInstructions',
];
