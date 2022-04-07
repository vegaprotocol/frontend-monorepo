import "./stateful-button.scss";

import { ButtonHTMLAttributes } from "react";

export const StatefulButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const classProp = props.className || "";
  return <button {...props} className={`stateful-button fill ${classProp}`} />;
};
