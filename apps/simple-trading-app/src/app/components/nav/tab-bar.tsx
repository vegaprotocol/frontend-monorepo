import { Nav } from './nav';
import React from 'react';

interface TabBarProps {
  className?: string;
}

export const TabBar = ({ className }: TabBarProps) => (
  <div role="group" aria-label="Tab Bar Navigation Menu" className={className}>
    <div role="presentation" className="py-[42px]" />
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black py-16">
      <Nav tabs className="flex justify-evenly items-center" />
    </div>
  </div>
);
