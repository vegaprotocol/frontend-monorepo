export const includesLeftPadding = (className?: string) =>
  !!className?.match(/(^| )p(l|x)-\d+( |$)/);

export const includesRightPadding = (className?: string) =>
  !!className?.match(/(^| )p(r|x)-\d+( |$)/);

export const includesBorderWidth = (className?: string) =>
  !!className?.match(/(^| )border-\d+( |$)/);

export const includesHeight = (className?: string) =>
  !!className?.match(/(^| )h-\d+( |$)/);
