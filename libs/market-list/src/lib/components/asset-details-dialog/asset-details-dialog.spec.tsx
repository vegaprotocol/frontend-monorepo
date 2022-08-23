import { MockedProvider } from '@apollo/react-testing';
import { render, screen } from '@testing-library/react';
import {
  AssetDetailsDialog,
  ASSETS_CONNECTION_QUERY,
} from './asset-details-dialog';

const mockedData = {
  data: {
    assetsConnection: {
      edges: [
        {
          node: {
            id: 'XYZalpha',
            name: 'XYZ (α alpha)',
            symbol: 'XYZalpha',
            decimals: 5,
            quantum: '1',
            source: {
              __typename: 'BuiltinAsset',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'XYZbeta',
            name: 'XYZ (β beta)',
            symbol: 'XYZbeta',
            decimals: 5,
            quantum: '1',
            source: {
              __typename: 'BuiltinAsset',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'XYZdelta',
            name: 'XYZ (δ delta)',
            symbol: 'XYZdelta',
            decimals: 5,
            quantum: '1',
            source: {
              __typename: 'BuiltinAsset',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'XYZepsilon',
            name: 'XYZ (ε epsilon)',
            symbol: 'XYZepsilon',
            decimals: 5,
            quantum: '1',
            source: {
              __typename: 'BuiltinAsset',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'XYZgamma',
            name: 'XYZ (γ gamma)',
            symbol: 'XYZgamma',
            decimals: 5,
            quantum: '1',
            source: {
              __typename: 'BuiltinAsset',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '2282ffc06a557173d297739305cc69f6444cdbbb1089df7d9aef32bbfd735ba1',
            name: 'Tim Token (Vega)',
            symbol: 'TIM',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0x920B2375BCAC8cCDfDEFD74426c55C48e0304e4F',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '449dbfb66e7a444c485b4fdc77ddc6bbf81abbf7c8e247ac299c25e9557b99cf',
            name: 'Taker Reward Token (Vega)',
            symbol: 'TAK',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0xf700Ce952B6EA11c01b43e5579C6D63286ff8CF0',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
            name: 'tBTC TEST',
            symbol: 'tBTC',
            decimals: 5,
            quantum: '1',
            source: {
              contractAddress: '0xC912F059b4eCCEF6C969B2E0e2544A1A2581C094',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            name: 'tDAI TEST',
            symbol: 'tDAI',
            decimals: 5,
            quantum: '1',
            source: {
              contractAddress: '0xF4A2bcC43D24D14C4189Ef45fCf681E870675333',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
            name: 'tEURO TEST',
            symbol: 'tEURO',
            decimals: 5,
            quantum: '1',
            source: {
              contractAddress: '0xD52b6C949E35A6E4C64b987B1B192A8608931a7b',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '98032ba34576f8012de9b822e1da3ed4b6223a4f4e05f573002d441ffb4bf314',
            name: 'Liquidity Reward Token (Vega)',
            symbol: 'LIQ',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0xD2f21E37e78dD91b60FE3dD74A112e1a53b33057',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: '993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede',
            name: 'tUSDC TEST',
            symbol: 'tUSDC',
            decimals: 5,
            quantum: '1',
            source: {
              contractAddress: '0x3773A5c7aFF77e014cBF067dd31801b4C6dc4136',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'ba98cdeeec849a053e60cc03808e91e90d9d2e62425c76a590617b95ad41a066',
            name: 'Steve Token (Vega)',
            symbol: 'STE',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0x5a16941cca2Db4AcdFC28Ac77a3e9652Fdf102e1',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'ce3fb1ab0717f0adbce019d7aef53aacdbadefe2d30ad1647b55f134d4072c90',
            name: 'Woz Token (Vega)',
            symbol: 'WOZ',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0x5E4b9aDA947130Fc320a144cd22bC1641e5c9d81',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'ebcd94151ae1f0d39a4bde3b21a9c7ae81a80ea4352fb075a92e07608d9c953d',
            name: 'Maker Reward Token (Vega)',
            symbol: 'MAK',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0x8ec701DA58394F5d2c8C2873D31039454D5845C1',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55',
            name: 'Vega (testnet)',
            symbol: 'VEGA',
            decimals: 18,
            quantum: '1',
            source: {
              contractAddress: '0xDc335304979D378255015c33AbFf09B60c31EBAb',
              lifetimeLimit: '0',
              withdrawThreshold: '0',
              __typename: 'ERC20',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
      ],
      __typename: 'AssetsConnection',
    },
  },
};

const mocks = [
  {
    request: {
      query: ASSETS_CONNECTION_QUERY,
      variables: {},
    },
    result: mockedData,
  },
];

const WrappedAssetDetailsDialog = ({
  assetSymbol,
}: {
  assetSymbol: string;
}) => (
  <MockedProvider mocks={mocks}>
    <AssetDetailsDialog
      assetSymbol={assetSymbol}
      open={true}
      onChange={() => false}
    ></AssetDetailsDialog>
  </MockedProvider>
);

describe('AssetDetailsDialog', () => {
  it('should show no data message given unknown asset symbol', () => {
    render(<WrappedAssetDetailsDialog assetSymbol={'UNKNOWN_FOR_SURE'} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  const cases = [
    ['tDAI', 'tDAI', 'tDAI TEST', '21,000,000'],
    ['VEGA', 'VEGA', 'Vega (testnet)', '64,999,723,000,000,000,000,000,000'],
    ['tUSDC', 'tUSDC', 'tUSDC TEST', '21,000,000'],
  ];
  it.each(cases)(
    'should show correct data given %p symbol',
    async (requestedSymbol, symbol, name, totalSupply) => {
      render(<WrappedAssetDetailsDialog assetSymbol={requestedSymbol} />);
      expect((await screen.findByTestId('symbol_value')).textContent).toContain(
        symbol
      );
      expect((await screen.findByTestId('name_value')).textContent).toContain(
        name
      );
    }
  );
});
