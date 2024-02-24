import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { create } from 'zustand';
import { TransferContainer } from '@vegaprotocol/accounts';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { DepositContainer } from '@vegaprotocol/deposits';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { TinyScroll, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { NodeHealthContainer } from '../node-health';
import { Settings } from '../settings';
import { Tooltip } from '../../components/tooltip';
import { WithdrawContainer } from '../withdraw-container';
import { GetStarted } from '../welcome-dialog';
import { useConnect, usePubKeys } from '@vegaprotocol/wallet-react';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../error-boundary';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';

export enum ViewType {
  Order = 'Order',
  Info = 'Info',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
  Settings = 'Settings',
  ViewAs = 'ViewAs',
  Close = 'Close',
}

export type BarView =
  | {
      type: ViewType.Deposit;
      assetId?: string;
    }
  | {
      type: ViewType.Withdraw;
      assetId?: string;
    }
  | {
      type: ViewType.Transfer;
      assetId?: string;
    }
  | {
      type: ViewType.Order;
    }
  | {
      type: ViewType.Info;
    }
  | {
      type: ViewType.Settings;
    }
  | {
      type: ViewType.Close;
    };

export const Sidebar = ({ options }: { options?: ReactNode }) => {
  const { connect } = useConnect();
  const { pubKeys } = usePubKeys();
  const t = useT();
  const currentRouteId = useGetCurrentRouteId();
  const navClasses = 'flex lg:flex-col items-center gap-2 lg:gap-4 p-1';
  const { isMobile } = useScreenDimensions();
  const { getView } = useSidebar((store) => ({
    setViews: store.setViews,
    getView: store.getView,
  }));
  const currView = getView(currentRouteId);
  return (
    <div className="flex h-full lg:flex-col gap-1" data-testid="sidebar">
      {options && (
        <nav className={classNames(navClasses, 'flex grow')}>{options}</nav>
      )}
      <nav
        className={classNames(
          navClasses,
          'ml-auto lg:mt-auto lg:ml-0 shrink-0'
        )}
      >
        {!isMobile ? (
          <>
            <SidebarButton
              view={ViewType.ViewAs}
              onClick={async () => {
                await connect('readOnly');
              }}
              icon={VegaIconNames.EYE}
              tooltip={t('View as party')}
              disabled={Boolean(pubKeys.length)}
              routeId={currentRouteId}
            />
            <SidebarButton
              view={ViewType.Settings}
              icon={VegaIconNames.COG}
              tooltip={t('Settings')}
              routeId={currentRouteId}
            />
          </>
        ) : (
          currView && (
            <SidebarButton
              view={ViewType.Close}
              icon={VegaIconNames.ARROW_LEFT}
              tooltip={t('Back')}
              routeId={currentRouteId}
            />
          )
        )}
        <NodeHealthContainer />
      </nav>
    </div>
  );
};

export const SidebarButton = ({
  view,
  icon,
  tooltip,
  disabled = false,
  onClick,
  routeId,
}: {
  view?: ViewType;
  icon: VegaIconNames;
  tooltip: string;
  disabled?: boolean;
  onClick?: () => void;
  routeId: string;
}) => {
  const { setViews, getView } = useSidebar((store) => ({
    setViews: store.setViews,
    getView: store.getView,
  }));
  const currView = getView(routeId);
  const onSelect = (view: BarView['type']) => {
    if (view === currView?.type) {
      setViews(null, routeId);
    } else {
      setViews({ type: view }, routeId);
    }
  };

  const buttonClasses = classNames(
    'flex items-center p-1 rounded',
    'disabled:cursor-not-allowed disabled:text-vega-clight-500 dark:disabled:text-vega-cdark-500',
    {
      'text-vega-clight-200 dark:text-vega-cdark-200 enabled:hover:bg-vega-clight-500 dark:enabled:hover:bg-vega-cdark-500':
        !view || view !== currView?.type,
      'bg-vega-yellow enabled:hover:bg-vega-yellow-550 text-black':
        view && view === currView?.type,
    }
  );

  return (
    <Tooltip
      description={tooltip}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={0}
    >
      <button
        className={buttonClasses}
        data-testid={view}
        onClick={onClick || (() => onSelect(view as BarView['type']))}
        disabled={disabled}
      >
        <VegaIcon name={icon} size={20} />
      </button>
    </Tooltip>
  );
};

export const SidebarDivider = () => {
  return (
    <div
      className="w-px h-4 bg-vega-clight-600 dark:bg-vega-cdark-600 lg:w-4 lg:h-px"
      role="separator"
    />
  );
};

export const SidebarContent = () => {
  const t = useT();
  const params = useParams();
  const currentRouteId = useGetCurrentRouteId();

  const { setViews, getView } = useSidebar();
  const view = getView(currentRouteId);
  if (!view) return null;

  if (view.type === ViewType.Order) {
    if (params.marketId) {
      return (
        <ContentWrapper>
          <ErrorBoundary feature="deal-ticket">
            <DealTicketContainer
              marketId={params.marketId}
              onDeposit={(assetId) =>
                setViews({ type: ViewType.Deposit, assetId }, currentRouteId)
              }
            />
          </ErrorBoundary>
          <GetStarted />
        </ContentWrapper>
      );
    } else {
      return <CloseSidebar />;
    }
  }

  if (view.type === ViewType.Close) {
    return <CloseSidebar />;
  }

  if (view.type === ViewType.Info) {
    if (params.marketId) {
      return (
        <ContentWrapper>
          <ErrorBoundary feature="market-info">
            <MarketInfoAccordionContainer marketId={params.marketId} />
          </ErrorBoundary>
        </ContentWrapper>
      );
    } else {
      return <CloseSidebar />;
    }
  }

  if (view.type === ViewType.Deposit) {
    return (
      <ContentWrapper title={t('Deposit')}>
        <ErrorBoundary feature="deposit">
          <DepositContainer assetId={view.assetId} />
        </ErrorBoundary>
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Withdraw) {
    return (
      <ContentWrapper title={t('Withdraw')}>
        <ErrorBoundary feature="withdraw">
          <WithdrawContainer assetId={view.assetId} />
        </ErrorBoundary>
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Transfer) {
    return (
      <ContentWrapper title={t('Transfer')}>
        <ErrorBoundary feature="transfer">
          <TransferContainer assetId={view.assetId} />
        </ErrorBoundary>
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Settings) {
    return (
      <ContentWrapper title={t('Settings')}>
        <ErrorBoundary feature="settings">
          <Settings />
        </ErrorBoundary>
      </ContentWrapper>
    );
  }

  throw new Error('invalid sidebar');
};

const ContentWrapper = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => {
  return (
    <TinyScroll
      className="h-full py-4 pl-3 pr-4 overflow-auto"
      // panes have p-1, since sidebar is on the right make pl less to account for additional pane space
      data-testid="sidebar-content"
    >
      {title && <h2 className="mb-4">{title}</h2>}
      {children}
    </TinyScroll>
  );
};

/** If rendered will close sidebar */
const CloseSidebar = () => {
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);
  useEffect(() => {
    setViews(null, currentRouteId);
  }, [setViews, currentRouteId]);
  return null;
};

export const useSidebar = create<{
  views: { [key: string]: BarView | null };
  setViews: (view: BarView | null, routeId: string) => void;
  getView: (routeId: string) => BarView | null | undefined;
}>()((set, get) => ({
  views: {},
  setViews: (x, routeId) =>
    set(({ views }) => ({ views: { ...views, [routeId]: x } })),
  getView: (routeId) => get().views[routeId],
}));
