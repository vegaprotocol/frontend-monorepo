import { Networks, useEnvironment } from '@vegaprotocol/environment';
import {
  ViewingAsBanner,
  AnnouncementBanner,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import React from 'react';

import { Nav } from '../nav';

export interface TemplateSidebarProps {
  children: React.ReactNode;
  sidebar: React.ReactNode[];
}

export function TemplateSidebar({ children, sidebar }: TemplateSidebarProps) {
  const { VEGA_ENV } = useEnvironment();
  const { isReadOnly, pubKey, disconnect } = useVegaWallet();
  return (
    <>
      <AnnouncementBanner>
        <div className="font-alpha calt uppercase text-center text-lg text-white">
          <span className="pr-4">The Mainnet sims are live!</span>
          <ExternalLink href="https://fairground.wtf/">
            Come help stress test the network
          </ExternalLink>
        </div>
      </AnnouncementBanner>
      <Nav navbarTheme={VEGA_ENV === Networks.TESTNET ? 'yellow' : 'dark'} />
      {isReadOnly ? (
        <ViewingAsBanner pubKey={pubKey} disconnect={disconnect} />
      ) : null}
      <div className="w-full border-b border-neutral-700 lg:grid lg:grid-rows-[1fr] lg:grid-cols-[1fr_450px]">
        <main className="col-start-1 p-4">{children}</main>
        <aside className="col-start-2 row-start-1 row-span-2 hidden lg:block p-4 bg-banner bg-contain border-l border-neutral-700">
          {sidebar.map((Component, i) => (
            <section className="mb-4 last:mb-0" key={i}>
              {Component}
            </section>
          ))}
        </aside>
      </div>
    </>
  );
}
