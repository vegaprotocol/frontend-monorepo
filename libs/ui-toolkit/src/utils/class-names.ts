export const paddingLeftProvided = (className?: string) =>
  !!className?.match(/(^| )p(l|x)-\d+( |$)/);
export const paddingRightProvided = (className?: string) =>
  !!className?.match(/(^| )p(r|x)-\d+( |$)/);
