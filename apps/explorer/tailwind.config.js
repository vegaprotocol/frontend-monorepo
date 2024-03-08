import { join } from 'path';
import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { vegaCustomClasses } from '@vegaprotocol/tailwindcss-config';

export default {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    'libs/ui-toolkit/src/utils/shared.ts',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    extend: theme,
  },
  plugins: [vegaCustomClasses],
};
