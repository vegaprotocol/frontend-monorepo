import { CONSTANTS } from '../../frontend/lib/constants';

const windows = globalThis.browser?.windows ?? globalThis.chrome?.windows;
// const runtime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime;

// const BUFFER_HEIGHT = 30;

// export const createWindow = (
//   top = undefined,
//   left = undefined,
//   once = false
// ) => {
//   const url = once ? 'index.html?once=1' : 'index.html';
//   return windows.create({
//     url: runtime.getURL(url),
//     type: 'popup',
//     focused: true,
//     // Approximate dimension. The client figures out exactly how big it should be as this height/width
//     // includes the frame and different OSes have different sizes
//     width: CONSTANTS.width,
//     height: CONSTANTS.defaultHeight + BUFFER_HEIGHT,
//     top,
//     left,
//   });
// };

export const createNotificationWindow = async () => {
  let left = 0;
  let top = 0;
  try {
    const lastFocused = await windows.getLastFocused();
    top = lastFocused.top;
    left = lastFocused.left + (lastFocused.width - CONSTANTS.width);
  } catch (_) {
    // NOOP
  }

  return createWindow(top, left, true);
};
