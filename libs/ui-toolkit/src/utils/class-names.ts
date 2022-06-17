export const includesLeftPadding = (className?: string) =>
  !!className?.match(/(^| )p(l|x)-\d+( |$)/);

export const includesRightPadding = (className?: string) =>
  !!className?.match(/(^| )p(r|x)-\d+( |$)/);

export const includesBorderWidth = (className?: string) =>
  !!className?.match(/(^| )border-\d+( |$)/);

export const includesHeight = (className?: string) =>
  !!className?.match(/(^| )h-(\d+|auto)( |$)/);

export const includesTextColor = (className?: string) =>
  !!className?.match(
    /(^|:| )text-((?!left|center|right|justify|start|end|ui|clip|ellipsis|xs|sm|base|lg|\d*xl|h\d)\w+)( |$)/
  );
