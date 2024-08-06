import { useEffect, useMemo, useState } from 'react';

import config from '!/config';

const pseudoRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 16_807) % 2_147_483_647;
    return value / 1_000_000_000;
  };
};

export const locators = {
  bone: 'bone',
  boneCol: 'bone-col',
  boneSquare: 'bone-square',
};

export const LoaderBone = ({
  width,
  height,
  baseSize = 1,
}: {
  width: number;
  height: number;
  baseSize?: number;
}) => {
  const [, forceRender] = useState(false);
  const generate = useMemo(() => pseudoRandom(1), []);

  useEffect(() => {
    /* istanbul ignore next */
    if (config.isTest) return;
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid={locators.bone}>
      <div className="flex flex-wrap">
        {Array.from({ length: width })
          .fill(null)
          .map((_, index) => (
            <div key={`bone-col-${index}`} data-testid={locators.boneCol}>
              {Array.from({ length: height })
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`bone-sqaure-${index}`}
                    data-testid={locators.boneSquare}
                    style={{
                      height: baseSize,
                      width: baseSize,
                      opacity: generate() > 1.5 ? 1 : 0,
                    }}
                    className="bg-white"
                  />
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};
