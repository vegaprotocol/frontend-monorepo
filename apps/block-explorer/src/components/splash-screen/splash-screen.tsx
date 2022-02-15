import "./splash-screen.scss";

import React from "react";

export const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  return <div className="splash-screen">{children}</div>;
};
