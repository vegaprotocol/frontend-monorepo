import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useRef, forwardRef } from 'react';
import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EpochCountdown } from '../../components/epoch-countdown';
import { BigNumber } from '../../lib/bignumber';
import {
  formatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/react-helpers';
import type { Nodes } from './__generated__/Nodes';
import type { Staking_epoch } from './__generated__/Staking';
import type { ColDef } from 'ag-grid-community';
import { LEAVING_VALIDATORS } from './leaving-validators';

const VALIDATOR = 'validator';
const STATUS = 'status';
const TOTAL_STAKE_THIS_EPOCH = 'totalStakeThisEpoch';
const VALIDATOR_STAKE = 'validatorStake';
const PENDING_STAKE = 'pendingStake';
const RANKING_SCORE = 'rankingScore';
const STAKE_SCORE = 'stakeScore';
const PERFORMANCE_SCORE = 'performanceScore';
const VOTING_POWER = 'votingPower';

export const NODES_QUERY = gql`
  query Nodes {
    nodes {
      avatarUrl
      id
      name
      pubkey
      stakedTotal
      stakedTotalFormatted @client
      pendingStake
      pendingStakeFormatted @client
      rankingScore {
        rankingScore
        stakeScore
        performanceScore
        votingPower
        status
      }
    }
    nodeData {
      stakedTotal
      stakedTotalFormatted @client
    }
  }
`;

interface NodeListProps {
  epoch: Staking_epoch | undefined;
}

const VALIDATOR_LOGO_MAP: { [key: string]: string } = {
  '55504e9bfd914a7bbefa342c82f59a2f4dee344e5b6863a14c02a812f4fbde32':
    'https://pbs.twimg.com/profile_images/1586047492629712897/ZVMWBE94_400x400.jpg',
  efbdf943443bd7595e83b0d7e88f37b7932d487d1b94aab3d004997273bb43fc:
    'https://pbs.twimg.com/profile_images/1026823609979949057/3e-LCHHm_400x400.jpg',
  '126751c5830b50d39eb85412fb2964f46338cce6946ff455b73f1b1be3f5e8cc':
    'https://pbs.twimg.com/profile_images/1228627868542029824/9aoaLiIx_400x400.jpg',
  '43697a3e911d8b70c0ce672adde17a5c38ca8f6a0486bf85ed0546e1b9a82887':
    'https://pbs.twimg.com/profile_images/1352167987478843392/XzX82gIb_400x400.jpg',
  ac735acc9ab11cf1d8c59c2df2107e00092b4ac96451cb137a1629af5b66242a:
    'https://pbs.twimg.com/profile_images/1159254945885016064/vhhp1wL4_400x400.jpg',
  '74023df02b8afc9eaf3e3e2e8b07eab1d2122ac3e74b1b0222daf4af565ad3dd':
    'https://cdn4.telegram-cdn.org/file/n_OJ6upnglNG95E7u5FyfLmqqBUhf25LqtyZD0UM27gMM_WWi8rywrp9JaAA83quP7vx-WU9Q86quvIRdk9wuUrC2tdD08cYxah4dXHa4OgphFg7Vm5UYFjuGxuHn916OIlzIuVOjJWK_nricGdlPcZQK_T4kBJ_5v4pp94j76_DQ1eSy8DjUxnchZxqpGFv-lGN8U4SjRMK0RC_6DusNaRYEn9Ni2ZQHig7nMiqud-nkK5RgUrClfXFwyhoMFVfhHpGUzwpSv1pSEVLXVh7E1mVmWYrW9hzdQGGrouWCGRqtf_hRa9enS2fv0P9mAB23BcURWuLOVtMdJTF4wfc-w.jpg',
};

interface ValidatorRendererProps {
  data: { validator: { avatarUrl: string; name: string }; id: string };
}

const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { avatarUrl, name } = data.validator;

  const logo = VALIDATOR_LOGO_MAP[data.id]
    ? VALIDATOR_LOGO_MAP[data.id]
    : avatarUrl
    ? avatarUrl
    : null;

  return (
    <div className="flex items-center">
      {logo && (
        <img
          className="h-6 w-6 rounded-full mr-2"
          src={logo}
          alt={`Avatar icon for ${name}`}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      {name}
    </div>
  );
};

// Custom styling to account for the scrollbar. This is needed because the
// AG Grid places the scrollbar over the bottom validator, which obstructs
const nodeListGridStyles = `
  .ag-theme-balham-dark .ag-body-horizontal-scroll {
    opacity: 0.75;
  }
`;

export const NodeList = ({ epoch }: NodeListProps) => {
  const { t } = useTranslation();
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { data, error, loading, refetch } = useQuery<Nodes>(NODES_QUERY, {
    errorPolicy: 'ignore',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!epoch?.timestamps.expiry) {
        return;
      }
      const now = Date.now();
      const expiry = new Date(epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [epoch?.timestamps.expiry, refetch]);

  const nodes = useMemo(() => {
    if (!data?.nodes) {
      return [];
    }

    return data.nodes
      .filter(({ id }) => !LEAVING_VALIDATORS.includes(id))
      .map(
        ({
          id,
          name,
          avatarUrl,
          stakedTotalFormatted,
          rankingScore: {
            rankingScore,
            stakeScore,
            status,
            performanceScore,
            votingPower,
          },
          pendingStakeFormatted,
        }) => {
          const stakedOnNode = new BigNumber(stakedTotalFormatted);
          const statusTranslated = t(`status-${status}`);

          return {
            id,
            [VALIDATOR]: {
              avatarUrl,
              name,
            },
            [STATUS]: statusTranslated,
            [TOTAL_STAKE_THIS_EPOCH]: formatNumber(stakedTotalFormatted, 2),
            [VALIDATOR_STAKE]: formatNumber(stakedOnNode, 2),
            [PENDING_STAKE]: formatNumber(pendingStakeFormatted, 2),
            [RANKING_SCORE]: formatNumber(new BigNumber(rankingScore), 5),
            [STAKE_SCORE]: formatNumberPercentage(
              new BigNumber(stakeScore).times(100),
              2
            ),
            [PERFORMANCE_SCORE]: formatNumber(
              new BigNumber(performanceScore),
              5
            ),
            [VOTING_POWER]: votingPower,
          };
        }
      );
  }, [data, t]);

  const gridRef = useRef<AgGridReact | null>(null);

  const compareStringifiedNumbers = (a: string, b: string) =>
    parseFloat(a.replace(/,/g, '')) - parseFloat(b.replace(/,/g, ''));

  const NodeListTable = forwardRef<AgGridReact>((_, ref) => {
    const colDefs = useMemo<ColDef[]>(
      () => [
        {
          field: VALIDATOR,
          headerName: t('validator').toString(),
          cellRenderer: ValidatorRenderer,
          comparator: ({ name: a }, { name: b }) => {
            if (a === b) {
              return 0;
            }
            return a > b ? 1 : -1;
          },
        },
        {
          field: STATUS,
          headerName: t('status').toString(),
          comparator: (a, b) => {
            if (a === b) {
              return 0;
            }
            return a > b ? 1 : -1;
          },
          width: 100,
        },
        {
          field: TOTAL_STAKE_THIS_EPOCH,
          headerName: t('totalStakeThisEpoch').toString(),
          comparator: (a: string, b: string) => compareStringifiedNumbers(a, b),
          width: 160,
        },
        {
          field: STAKE_SCORE,
          headerName: t('stakeScore').toString(),
          width: 100,
        },
        {
          field: VALIDATOR_STAKE,
          headerName: t('validatorStake').toString(),
          comparator: (a: string, b: string) => compareStringifiedNumbers(a, b),
          width: 120,
        },
        {
          field: PENDING_STAKE,
          headerName: t('nextEpoch').toString(),
          width: 100,
        },
        {
          field: RANKING_SCORE,
          headerName: t('rankingScore').toString(),
          width: 120,
          sort: 'desc',
        },
        {
          field: PERFORMANCE_SCORE,
          headerName: t('performanceScore').toString(),
          width: 100,
        },
        {
          field: VOTING_POWER,
          headerName: t('votingPower').toString(),
          width: 100,
        },
      ],
      []
    );

    const defaultColDef = useMemo(
      () => ({
        sortable: true,
        resizable: true,
        comparator: (a: string, b: string) => parseFloat(a) - parseFloat(b),
      }),
      []
    );

    return (
      <div data-testid="validators-grid">
        <AgGrid
          domLayout="autoHeight"
          style={{ width: '100%' }}
          customThemeParams={nodeListGridStyles}
          overlayNoRowsTemplate={t('noValidators')}
          ref={ref}
          rowData={nodes}
          rowHeight={32}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          suppressCellFocus={true}
          onCellClicked={(event) => {
            navigate(event.data.id);
          }}
        />
      </div>
    );
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={nodes}>
      {epoch && epoch.timestamps.start && epoch.timestamps.expiry && (
        <div className="mb-8">
          <EpochCountdown
            id={epoch.id}
            startDate={new Date(epoch.timestamps.start)}
            endDate={new Date(epoch.timestamps.expiry)}
          />
        </div>
      )}
      <NodeListTable ref={gridRef} />
    </AsyncRenderer>
  );
};
