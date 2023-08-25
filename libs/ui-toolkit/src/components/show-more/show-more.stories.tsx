import type { Story, Meta } from '@storybook/react';
import { ShowMore } from './show-more';

export default {
  component: ShowMore,
  title: 'ShowMore',
} as Meta;

const Template: Story = (args) => (
  <ShowMore {...args}>
    <p>
      Spaceflight will never tolerate carelessness, incapacity, and neglect.
      Somewhere, somehow, we screwed up. It could have been in design, build, or
      test. Whatever it was, we should have caught it. We were too gung ho about
      the schedule and we locked out all of the problems we saw each day in our
      work. “Every element of the program was in trouble and so were we. The
      simulators were not working, Mission Control was behind in virtually every
      area, and the flight and test procedures changed daily. Nothing we did had
      any shelf life. Not one of us stood up and said, ‘Dammit, stop!’ I don’t
      know what Thompson’s committee will find as the cause, but I know what I
      find. We are the cause! We were not ready! We did not do our job. We were
      rolling the dice, hoping that things would come together by launch day,
      when in our hearts we knew it would take a miracle. We were pushing the
      schedule and betting that the Cape would slip before we did. “From this
      day forward, Flight Control will be known by two words: ‘Tough’ and
      ‘Competent.’ Tough means we are forever accountable for what we do or what
      we fail to do. We will never again compromise our responsibilities. Every
      time we walk into Mission Control we will know what we stand for.
      Competent means we will never take anything for granted. We will never be
      found short in our knowledge and in our skills. Mission Control will be
      perfect. When you leave this meeting today you will go to your office and
      the first thing you will do there is to write ‘Tough and Competent’ on
      your blackboards. It will never be erased. Each day when you enter the
      room these words will remind you of the price paid by Grissom, White, and
      Chaffee. These words are the price of admission to the ranks of Mission
      Control.
    </p>
  </ShowMore>
);

export const Default = Template.bind({});
export const CustomMaxHeight = Template.bind({});
CustomMaxHeight.args = {
  closedMaxHeightPx: 50,
};

export const CustomOverlayColour = Template.bind({});
CustomOverlayColour.args = {
  overlayColourOverrides: 'to-yellow-400',
};
