import type { Story, Meta } from '@storybook/react';
import { OracleBasicProfile } from './oracle-basic-profile';

export default {
  component: OracleBasicProfile,
  title: 'OracleBasicProfile',
} as Meta;

const Template: Story = (args) => (
  <OracleBasicProfile provider={args['provider']} />
);

export const Primary = Template.bind({});

Primary.args = {
  provider: {
    name: 'Test oracle',
    url: 'https://zombo.com',
    description_markdown:
      'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
    oracle: {
      status: 'GOOD',
      status_reason: '',
      first_verified: '2023-02-28T00:00:00.000Z',
      last_verified: '2023-02-28T00:00:00.000Z',
      type: 'eth_address',
      eth_address: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
    },
    proofs: [
      {
        format: 'signed_message',
        available: true,
        type: 'eth_address',
        eth_address: '0x949AF81E51D57831AE52591d17fBcdd1014a5f52',
        message: 'SOMEHEX',
      },
    ],
    github_link:
      'https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/eth_address-0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC.toml',
  },
};
