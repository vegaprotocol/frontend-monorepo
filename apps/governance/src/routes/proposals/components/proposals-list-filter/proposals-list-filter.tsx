import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  Checkbox,
  FormGroup,
  Input,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  type ProposalChange,
  ProposalChangeMapping,
  ProposalState,
  ProposalStateMapping,
} from '@vegaprotocol/types';
import { cn } from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  type PersistStorage,
  type StorageValue,
  persist,
} from 'zustand/middleware';
import { CurrentProposalState } from '../current-proposal-state';
import flatten from 'lodash/flatten';

const proposalStates: ProposalState[] = [
  ProposalState.STATE_OPEN,
  ProposalState.STATE_ENACTED,
  ProposalState.STATE_PASSED,
  ProposalState.STATE_DECLINED,
  // Note: STATE_WAITING_FOR_NODE_VOTE is attached to STATE_OPEN in filtering
  // ProposalState.STATE_WAITING_FOR_NODE_VOTE,
  ProposalState.STATE_FAILED,
  ProposalState.STATE_REJECTED,
];

type ProposalType = ProposalChange['__typename'] | 'NetworkUpgrade';
const proposalTypes: ProposalType[] = [
  'NewAsset',
  'UpdateAsset',
  'NewMarket',
  'UpdateMarketState',
  'UpdateMarket',
  // Note: spot market related types are attached to generic new/update types in filtering
  // 'NewSpotMarket',
  // 'UpdateSpotMarket',
  'NewTransfer',
  'CancelTransfer',
  'UpdateNetworkParameter',
  'UpdateReferralProgram',
  'UpdateVolumeDiscountProgram',
  'NetworkUpgrade',
  'NewFreeform',
];

export type FilterStore = {
  states: ProposalState[];
  types: (ProposalType | 'NetworkUpgrade')[];
  id: string;
};
export type FilterActions = {
  addState: (state: ProposalState) => void;
  removeState: (state: ProposalState) => void;
  clearStates: () => void;
  addType: (type: ProposalType) => void;
  removeType: (type: ProposalType) => void;
  clearTypes: () => void;
  setId: (id: string) => void;
  reset: () => void;
};

export type Filter = FilterStore & FilterActions;

const DEFAULT_FILTER: FilterStore = {
  states: [],
  types: [],
  id: '',
};

export const BASE_FILTER: FilterStore = {
  states: [
    ProposalState.STATE_OPEN,
    ProposalState.STATE_ENACTED,
    ProposalState.STATE_PASSED,
    ProposalState.STATE_DECLINED,
    ProposalState.STATE_WAITING_FOR_NODE_VOTE,
  ],
  types: [
    'CancelTransfer',
    'NewAsset',
    'NewFreeform',
    'NewMarket',
    'NewSpotMarket',
    'NewTransfer',
    'UpdateAsset',
    'UpdateMarket',
    'UpdateMarketState',
    'UpdateNetworkParameter',
    'UpdateReferralProgram',
    'UpdateSpotMarket',
    'UpdateVolumeDiscountProgram',
    'NetworkUpgrade',
  ],
  id: '',
};

const toValue = (state: FilterStore) => {
  const allowed = ['states', 'types', 'id'];
  const value = flatten(
    Object.entries(state)
      .filter(([key]) => allowed.includes(key))
      .map(([, value]) => value)
  )
    .sort()
    .join('-');
  return value;
};

export const isEmpty = (state: FilterStore) => toValue(state).length === 0;

const getQueryString = (name: string): StorageValue<Filter> | null => {
  const search = globalThis.location.search;
  const params = new URLSearchParams(search);

  const entry = params.get(name);
  if (entry != null) {
    try {
      const parsed = JSON.parse(decodeURIComponent(entry));
      const store = {
        state: parsed,
        version: 0,
      };
      return store;
    } catch (err) {
      // NOOP
    }
  }
  return null;
};

const setQueryString = (name: string, value: StorageValue<Filter> | null) => {
  const search = globalThis.location.search;
  const initialParams = new URLSearchParams(search);
  const params = new URLSearchParams(search);
  if (value) params.set(name, JSON.stringify(value.state));
  else params.delete(name);
  const url = new URL(globalThis.location.href);
  url.search = params.toString();
  if (initialParams.toString() === params.toString()) {
    // do not push state if it's the same (prevents history clogging)
    return;
  }
  try {
    globalThis.history.pushState({}, '', url);
  } catch {
    // NOOP
  }
};

const queryStringStorage: PersistStorage<Filter> & {
  /**
   * A flag indicating whether to persist or not persist, that is the question.
   */
  PERSIST_LOCK: boolean;
} = {
  getItem: function (
    name: string
  ): StorageValue<Filter> | Promise<StorageValue<Filter> | null> | null {
    const value = getQueryString(name);
    return value;
  },
  setItem: function (
    name: string,
    value: StorageValue<Filter>
  ): void | Promise<void> {
    if (!queryStringStorage.PERSIST_LOCK) setQueryString(name, value);
  },
  removeItem: function (name: string): void | Promise<void> {
    setQueryString(name, null);
  },
  PERSIST_LOCK: false,
};

type PaginationStore = { page: number };
type PaginationActions = { setPage: (page: number) => void };
export const useProposalsPagination = create<
  PaginationStore & PaginationActions
>()(
  persist(
    immer((set) => ({
      page: 1,
      setPage: (page) => set({ page }),
    })),
    {
      name: 'pagination',
      storage: queryStringStorage,
    }
  )
);

export const useProposalsFilters = create<Filter>()(
  persist(
    immer((set) => ({
      // store
      ...DEFAULT_FILTER,
      // actions
      addState: (state) =>
        set((draft) => {
          if (!draft.states.includes(state)) draft.states.push(state);
        }),
      removeState: (state) =>
        set((draft) => {
          draft.states = draft.states.filter((s) => s !== state);
        }),
      clearStates: () =>
        set((draft) => {
          draft.states = [];
        }),
      addType: (type) =>
        set((draft) => {
          if (!draft.types.includes(type)) draft.types.push(type);
        }),
      removeType: (type) =>
        set((draft) => {
          draft.types = draft.types.filter((t) => t !== type);
        }),
      clearTypes: () =>
        set((draft) => {
          draft.types = [];
        }),
      setId: (id) =>
        set((draft) => {
          draft.id = id.toLowerCase();
        }),
      reset: () => set(DEFAULT_FILTER),
    })),
    {
      name: 'filter',
      storage: queryStringStorage,
    }
  )
);

export const Filters = ({ count }: { count?: number }) => {
  const { t } = useTranslation();

  const [showSettings, setShowSettings] = useState<boolean>(false);

  const filter = useProposalsFilters();
  const showLozenges = !isEmpty(filter);

  useProposalsFilters.subscribe((state) => {
    if (isEmpty(state)) {
      setShowSettings(false);
    }
  });

  /**
   * Here's a neat trick that allow the normal backwards / forwards button
   * navigation, the stores are being rehydrated from the query string value
   * without persisting just rehydrated state back to the query string.
   */
  useEffect(() => {
    const handler = async () => {
      queryStringStorage.PERSIST_LOCK = true;
      await useProposalsFilters.persist.rehydrate();
      await useProposalsPagination.persist.rehydrate();
      queryStringStorage.PERSIST_LOCK = false;
    };
    globalThis.addEventListener('popstate', handler);
    return () => {
      globalThis.removeEventListener('popstate', handler);
    };
  });

  return (
    <div data-testid="proposals-filter" className="mb-5 flex flex-col gap-2">
      <button
        data-testid="proposal-filter-toggle"
        onClick={() => {
          setShowSettings(!showSettings);
        }}
      >
        <div className="flex gap-2 items-center">
          <span className="text-lg">{t('FilterProposals')}</span>
          {count != null && (
            <Tooltip
              description={t(
                'The number of found proposals matching the below criteria.'
              )}
            >
              <span className="text-gs-200">({count})</span>
            </Tooltip>
          )}
          <VegaIcon name={VegaIconNames.KEBAB} size={24} />
        </div>
      </button>
      {showLozenges && (
        <ul className="list-none flex gap-1 flex-wrap">
          {proposalStates
            .filter((ps) => filter.states.includes(ps))
            .map((ps, i) => (
              <li key={i + 'ps'}>
                <CurrentProposalState proposalState={ps}>
                  <button
                    onClick={() => filter.removeState(ps)}
                    className="w-[10px] h-[10px] relative"
                  >
                    <VegaIcon
                      name={VegaIconNames.CROSS}
                      size={10}
                      className="!block !absolute top-[1px]"
                    />
                  </button>
                </CurrentProposalState>
              </li>
            ))}
          {proposalTypes
            .filter((pt) => filter.types.includes(pt))
            .map(
              (pt, i) =>
                pt != null && (
                  <li
                    key={i + 'pt'}
                    className={cn(
                      'bg-gs-600 text-xs px-1 py-[2px] rounded',
                      'flex items-center gap-1'
                    )}
                  >
                    <span>
                      {pt !== 'NetworkUpgrade'
                        ? ProposalChangeMapping[pt]
                        : t('networkUpgrade')}
                    </span>
                    <button
                      onClick={() => filter.removeType(pt)}
                      className="w-[10px] h-[10px] relative"
                    >
                      <VegaIcon
                        name={VegaIconNames.CROSS}
                        size={10}
                        className="!block !absolute top-[1px]"
                      />
                    </button>
                  </li>
                )
            )}
          {filter.id && filter.id.length > 0 && (
            <li
              key={'id'}
              className={cn(
                'bg-vega-blue-550 text-xs px-1 py-[2px] rounded',
                'flex items-center gap-1'
              )}
            >
              <span>
                {t('ID')}: {filter.id}
              </span>
              <button
                onClick={() => filter.setId('')}
                className="w-[10px] h-[10px] relative"
              >
                <VegaIcon
                  name={VegaIconNames.CROSS}
                  size={10}
                  className="!block !absolute top-[1px]"
                />
              </button>
            </li>
          )}
        </ul>
      )}
      {showSettings && (
        <div
          data-testid="filter-settings"
          className="mt-3 flex flex-col gap-3 text-sm"
        >
          {/** States: */}
          <div>
            <div className="flex gap-2">
              <span className="font-semibold">
                {t('Include proposal states')}
              </span>
              <button
                className="text-xs text-gs-200 hover:text-gs-50"
                onClick={() => {
                  proposalStates.forEach((ps) => filter.addState(ps));
                }}
              >
                select all
              </button>
              <button
                className="text-xs text-gs-200 hover:text-gs-50"
                onClick={() => {
                  filter.clearStates();
                }}
              >
                deselect all
              </button>
            </div>
            <ul className="list-none grid grid-cols-1 md:grid-cols-3">
              {proposalStates.map((ps, i) => (
                <li key={i}>
                  <label className="flex gap-1">
                    <Checkbox
                      checked={filter.states.includes(ps)}
                      onCheckedChange={(checked) =>
                        checked ? filter.addState(ps) : filter.removeState(ps)
                      }
                    />{' '}
                    <Tooltip
                      description={
                        !filter.states.includes(ps) &&
                        !BASE_FILTER.states.includes(ps) ? (
                          <Trans
                            i18nKey={
                              'The <0>{{state}}</0> state is excluded by default. The <0>{{state}}</0> proposals will not be included in the results unless checked.'
                            }
                            values={{ state: ProposalStateMapping[ps] }}
                            components={[
                              <span className="lowercase">
                                {ProposalStateMapping[ps]}
                              </span>,
                            ]}
                          />
                        ) : null
                      }
                    >
                      <span
                        className={cn({
                          ' text-gs-100 cursor-help':
                            !filter.states.includes(ps) &&
                            !BASE_FILTER.states.includes(ps),
                        })}
                      >
                        {ProposalStateMapping[ps]}
                      </span>
                    </Tooltip>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/** Types: */}
          <div>
            <div className="flex gap-2">
              <span className="font-semibold">
                {t('Include proposal types')}
              </span>

              <button
                className="text-xs text-gs-200 hover:text-gs-50"
                onClick={() => {
                  proposalTypes.forEach((pt) => filter.addType(pt));
                }}
              >
                select all
              </button>
              <button
                className="text-xs text-gs-200 hover:text-gs-50"
                onClick={() => {
                  filter.clearTypes();
                }}
              >
                deselect all
              </button>
            </div>
            <ul className="list-none grid grid-cols-1 md:grid-cols-3">
              {proposalTypes.map((pt, i) => {
                if (!pt) return null;
                const label =
                  pt !== 'NetworkUpgrade'
                    ? ProposalChangeMapping[pt]
                    : t('networkUpgrade');

                return (
                  <li key={i}>
                    <label className="flex gap-1">
                      <Checkbox
                        checked={filter.types.includes(pt)}
                        onCheckedChange={(checked) =>
                          checked ? filter.addType(pt) : filter.removeType(pt)
                        }
                      />{' '}
                      {label}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          {/** IDs: */}
          <div>
            <label>
              <span className="text-sm font-semibold">
                {t('FilterProposalsDescription')}
              </span>
              <FormGroup
                label="Filter text input"
                labelFor="filter-input"
                hideLabel={true}
                className="relative"
              >
                <Input
                  value={filter.id}
                  data-testid="filter-input"
                  id="filter-input"
                  onChange={(e) => {
                    filter.setId(e.target.value);
                  }}
                  className="text-xs !p-1 !pr-6"
                />
                {filter.id && filter.id.length > 0 && (
                  <button
                    className="absolute top-2 right-2"
                    onClick={() => {
                      filter.setId('');
                    }}
                    data-testid="clear-filter"
                  >
                    <VegaIcon
                      name={VegaIconNames.CROSS}
                      size={12}
                      className="text-gs-100 absolute top-0 right-0"
                    />
                  </button>
                )}
              </FormGroup>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
