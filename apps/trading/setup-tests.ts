import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;

// Required by radix-ui/react-tooltip
global.DOMRect = class DOMRect {
  bottom = 0;
  left = 0;
  right = 0;
  top = 0;

  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}
  static fromRect(other?: DOMRectInit): DOMRect {
    return new DOMRect(other?.x, other?.y, other?.width, other?.height);
  }
  toJSON() {
    return JSON.stringify(this);
  }
};
