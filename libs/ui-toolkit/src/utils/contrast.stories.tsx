import type { Story, Meta } from '@storybook/react';

interface ContrastCheckerProps {
  backgrounds: string[];
  foregrounds: string[];
  backgroundColor: string;
}

const ContrastChecker = ({
  backgrounds,
  foregrounds,
  backgroundColor,
}: ContrastCheckerProps) => (
  <div style={{ backgroundColor }}>
    {backgrounds.map((backgroundColor) => (
      <div key={backgroundColor} style={{ backgroundColor, margin: '16px' }}>
        {foregrounds.map((color) => (
          <div
            id={`${backgroundColor}-${color}`}
            style={{ color, padding: '8px' }}
            key={color}
          >
            {color} on {backgroundColor}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default {
  component: ContrastChecker,
  title: 'Primitives/Contrast',
  parameters: { themes: false },
} as Meta;

const Template: Story = (args) => (
  <ContrastChecker {...(args as ContrastCheckerProps)} />
);

export const GrayAlpha = Template.bind({});
GrayAlpha.args = {
  backgroundColor: 'white',
  backgrounds: [
    'white',
    ' rgba(0,0,0,0.02)',
    ' rgba(0,0,0,0.05)',
    ' rgba(0,0,0,0.10)',
    ' rgba(0,0,0,0.15)',
    ' rgba(0,0,0,0.20)',
    ' rgba(0,0,0,0.25)',
    ' rgba(0,0,0,0.30)',
  ],
  foregrounds: [
    'black',
    ' rgba(0,0,0,0.98)',
    ' rgba(0,0,0,0.95)',
    ' rgba(0,0,0,0.90)',
    ' rgba(0,0,0,0.85)',
    ' rgba(0,0,0,0.80)',
    ' rgba(0,0,0,0.75)',
    ' rgba(0,0,0,0.70)',
    ' rgba(0,0,0,0.65)',
    ' rgba(0,0,0,0.60)',
    ' rgba(0,0,0,0.55)',
    ' rgba(0,0,0,0.50)',
  ],
};

export const GrayAlphaDark = Template.bind({});
GrayAlphaDark.args = {
  backgroundColor: 'black',
  backgrounds: [
    'black',
    ' rgba(255,255,255,0.02)',
    ' rgba(255,255,255,0.05)',
    ' rgba(255,255,255,0.10)',
    ' rgba(255,255,255,0.15)',
    ' rgba(255,255,255,0.20)',
    ' rgba(255,255,255,0.25)',
    ' rgba(255,255,255,0.30)',
  ],
  foregrounds: [
    'white',
    ' rgba(255,255,255,0.98)',
    ' rgba(255,255,255,0.95)',
    ' rgba(255,255,255,0.90)',
    ' rgba(255,255,255,0.85)',
    ' rgba(255,255,255,0.80)',
    ' rgba(255,255,255,0.75)',
    ' rgba(255,255,255,0.70)',
    ' rgba(255,255,255,0.65)',
    ' rgba(255,255,255,0.60)',
    ' rgba(255,255,255,0.55)',
    ' rgba(255,255,255,0.50)',
  ],
};

export const VegaYellowBackground = Template.bind({});
VegaYellowBackground.args = {
  backgroundColor: 'white',
  backgrounds: [
    'rgba(237, 255, 34)',
    'rgba(237, 255, 34, 0.98)',
    'rgba(237, 255, 34, 0.95)',
    'rgba(237, 255, 34, 0.90)',
    'rgba(237, 255, 34, 0.85)',
    'rgba(237, 255, 34, 0.80)',
    'rgba(237, 255, 34, 0.75)',
    'rgba(237, 255, 34, 0.70)',
    'rgba(237, 255, 34, 0.65)',
    'rgba(237, 255, 34, 0.60)',
  ],
  foregrounds: [
    'black',
    ' rgba(0,0,0,0.98)',
    ' rgba(0,0,0,0.95)',
    ' rgba(0,0,0,0.90)',
    ' rgba(0,0,0,0.85)',
    ' rgba(0,0,0,0.80)',
    ' rgba(0,0,0,0.75)',
    ' rgba(0,0,0,0.70)',
    ' rgba(0,0,0,0.65)',
    ' rgba(0,0,0,0.60)',
    ' rgba(0,0,0,0.55)',
    ' rgba(0,0,0,0.50)',
  ],
};

export const VegaYellowBackgroundDark = Template.bind({});
VegaYellowBackgroundDark.args = {
  backgroundColor: 'black',
  backgrounds: [
    'rgba(237, 255, 34)',
    'rgba(237, 255, 34, 0.98)',
    'rgba(237, 255, 34, 0.95)',
    'rgba(237, 255, 34, 0.90)',
    'rgba(237, 255, 34, 0.85)',
    'rgba(237, 255, 34, 0.80)',
    'rgba(237, 255, 34, 0.75)',
    'rgba(237, 255, 34, 0.70)',
    'rgba(237, 255, 34, 0.65)',
    'rgba(237, 255, 34, 0.60)',
    'rgba(237, 255, 34, 0.55)',
    'rgba(237, 255, 34, 0.50)',
    'rgba(237, 255, 34, 0.45)',
    'rgba(237, 255, 34, 0.40)',
    'rgba(237, 255, 34, 0.35)',
    'rgba(237, 255, 34, 0.30)',
    'rgba(237, 255, 34, 0.25)',
  ],
  foregrounds: [
    'black',
    ' rgba(0,0,0,0.98)',
    ' rgba(0,0,0,0.95)',
    ' rgba(0,0,0,0.90)',
    ' rgba(0,0,0,0.85)',
    ' rgba(0,0,0,0.80)',
    ' rgba(0,0,0,0.75)',
    ' rgba(0,0,0,0.70)',
    ' rgba(0,0,0,0.65)',
    ' rgba(0,0,0,0.60)',
    ' rgba(0,0,0,0.55)',
    ' rgba(0,0,0,0.50)',
  ],
};

export const VegaYellowBackgroundDarkWhiteText = Template.bind({});
VegaYellowBackgroundDarkWhiteText.args = {
  backgroundColor: 'black',
  backgrounds: [
    'rgba(237, 255, 34)',
    'rgba(237, 255, 34, 0.98)',
    'rgba(237, 255, 34, 0.95)',
    'rgba(237, 255, 34, 0.90)',
    'rgba(237, 255, 34, 0.85)',
    'rgba(237, 255, 34, 0.80)',
    'rgba(237, 255, 34, 0.75)',
    'rgba(237, 255, 34, 0.70)',
    'rgba(237, 255, 34, 0.65)',
    'rgba(237, 255, 34, 0.60)',
    'rgba(237, 255, 34, 0.55)',
    'rgba(237, 255, 34, 0.50)',
    'rgba(237, 255, 34, 0.45)',
    'rgba(237, 255, 34, 0.40)',
    'rgba(237, 255, 34, 0.35)',
    'rgba(237, 255, 34, 0.30)',
    'rgba(237, 255, 34, 0.25)',
  ],
  foregrounds: [
    'white',
    ' rgba(255, 255, 255, 0.98)',
    ' rgba(255, 255, 255, 0.95)',
    ' rgba(255, 255, 255, 0.90)',
    ' rgba(255, 255, 255, 0.85)',
    ' rgba(255, 255, 255, 0.80)',
    ' rgba(255, 255, 255, 0.75)',
    ' rgba(255, 255, 255, 0.70)',
    ' rgba(255, 255, 255, 0.65)',
    ' rgba(255, 255, 255, 0.60)',
    ' rgba(255, 255, 255, 0.55)',
    ' rgba(255, 255, 255, 0.50)',
  ],
};

export const VegaYellowColor = Template.bind({});
VegaYellowColor.args = {
  backgroundColor: 'black',
  backgrounds: [
    'white',
    'rgba(255,255,255,0.98)',
    ' rgba(255,255,255,0.95)',
    ' rgba(255,255,255.90)',
    ' rgba(255,255,255,0.85)',
    ' rgba(255,255,255,0.80)',
    ' rgba(255,255,255,0.75)',
    ' rgba(255,255,255,0.70)',
    ' rgba(255,255,255,0.65)',
    ' rgba(255,255,255,0.60)',
    ' rgba(255,255,255,0.55)',
    ' rgba(255,255,255,0.50)',
    ' rgba(255,255,255,0.45)',
    ' rgba(255,255,255,0.40)',
    ' rgba(255,255,255,0.35)',
  ],
  foregrounds: [
    '#edff22',
    '#ecff1c',
    '#ebff13',
    '#eaff05',
    '#e1f500',
    '#d4e700',
    '#c7d800',
    '#b9ca00',
    '#acbb00',
    '#9fad00',
    '#929e00',
    '#849000',
    '#778200',
    '#6f7900',
    '#6a7300',
    '#5c6500',
    '#4f5600',
  ],
};

export const VegaYellowColorDark = Template.bind({});
VegaYellowColorDark.args = {
  backgroundColor: 'white',
  backgrounds: [
    'black',
    ' rgba(0,0,0,0.98)',
    ' rgba(0,0,0,0.95)',
    ' rgba(0,0,0,0.90)',
    ' rgba(0,0,0,0.85)',
    ' rgba(0,0,0,0.80)',
    ' rgba(0,0,0,0.75)',
    ' rgba(0,0,0,0.70)',
    ' rgba(0,0,0,0.65)',
    ' rgba(0,0,0,0.60)',
    ' rgba(0,0,0,0.55)',
    ' rgba(0,0,0,0.50)',
  ],
  foregrounds: ['#edff22'],
};
