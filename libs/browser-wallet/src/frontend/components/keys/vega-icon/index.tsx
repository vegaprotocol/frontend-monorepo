import { useEffect, useRef } from 'react';

export const locators = {
  keyIcon: 'key-icon',
};

function getBitsFromByte(byte: number) {
  const bits = [];
  for (let index = 0; index < 8; index++) {
    bits.push(byte & (1 << index));
  }
  return bits;
}

const getColorList = (publicKey: string) => {
  return Array.from({ length: 4 })
    .fill(null)
    .flatMap((_, index) => {
      const color1 = '#' + publicKey.slice(index * 16, index * 16 + 6);
      const color2 = '#' + publicKey.slice(index * 16 + 6, index * 16 + 12);
      const pattern = publicKey.slice(index * 16 + 12, index * 16 + 14); // each bit represents a pixel in the 3x3 grid except the center pixel
      const centerColor = publicKey.slice(index * 16 + 14, index * 16 + 16);

      const bits = getBitsFromByte(Number.parseInt(pattern, 16));

      // Iterate through each pixel in the 3x3 grid
      let bitIndex = 0;
      return Array.from({ length: 9 })
        .fill(null)
        .map((_, gridPos) => {
          if (gridPos === 4) {
            // center pixel, it's color is determined by the first bit of the centerColor byte
            let color = color1;
            if (Number.parseInt(centerColor, 16) & 0x80) {
              color = color2;
            }
            return color;
          } else if (bits[bitIndex]) {
            bitIndex++;
            return color2;
          } else {
            bitIndex++;
            return color1;
          }
        });
    });
};

export const KeyIcon = ({ publicKey }: { publicKey: string }) => {
  const canvasReference = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasReference.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;
    const colorsList = getColorList(publicKey);
    const height = 42;
    const squareSize = height / 6;
    canvas.width = height;
    canvas.height = height;
    let colorIndex = 0;
    // Draw the first 2 rows
    for (let index = 0; index < 2; index++) {
      const start_x = index * 3 * squareSize;
      const start_y = 0;
      // Draw each horizontal line
      for (let x = 0; x < 3; x++) {
        // Draw each square in the line
        for (let y = 0; y < 3; y++) {
          context.fillStyle = colorsList[colorIndex];
          context.fillRect(
            start_x + x * squareSize,
            start_y + y * squareSize,
            squareSize,
            squareSize
          );
          colorIndex++;
        }
      }
    }

    // Draw the last 2 rows
    for (let index = 2; index < 4; index++) {
      // Draw left to right
      const start_x = (index - 2) * 3 * squareSize;
      // Offset by the height of the first 2 rows
      const start_y = 3 * squareSize;

      // Draw each horizontal line
      for (let x = 0; x < 3; x++) {
        // Draw each square in the line
        for (let y = 0; y < 3; y++) {
          context.fillStyle = colorsList[colorIndex];
          context.fillRect(
            start_x + x * squareSize,
            start_y + y * squareSize,
            squareSize,
            squareSize
          );
          colorIndex++;
        }
      }
    }
  }, [publicKey]);

  return (
    <div className="rounded-md overflow-hidden" style={{ minWidth: 42 }}>
      <canvas data-testid={locators.keyIcon} ref={canvasReference} />
    </div>
  );
};
