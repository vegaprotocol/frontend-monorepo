import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Callout } from ".";

export default {
  title: "Callout",
  component: Callout,
} as ComponentMeta<typeof Callout>;

const Template: ComponentStory<typeof Callout> = (args) => (
  <Callout {...args}>Content</Callout>
);

export const Default = Template.bind({});
Default.args = {};

export const Success = Template.bind({});
Success.args = {
  intent: "success",
};

export const Error = Template.bind({});
Error.args = {
  intent: "error",
};

export const Warning = Template.bind({});
Warning.args = {
  intent: "warn",
};
