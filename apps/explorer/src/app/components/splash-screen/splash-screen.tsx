import React from 'react';

export const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center text-center w-full h-full text-white text-[20px]">
      {children}
    </div>
  );
};
