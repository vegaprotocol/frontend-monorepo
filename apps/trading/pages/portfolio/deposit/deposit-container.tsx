import { useRef } from 'react';
import { ethers } from 'ethers';
import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { DepositForm } from './deposit-form';
import { useWeb3React } from '@web3-react/core';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';

const DEPOSIT_FORM_QUERY = gql`
  query DepositForm {
    assets {
      id
      symbol
      name
      decimals
      source {
        ... on ERC20 {
          contractAddress
        }
      }
    }
  }
`;

interface DepositContainerProps {
  ethereumConfig: EthereumConfig;
}

export const DepositContainer = ({ ethereumConfig }: DepositContainerProps) => {
  const { provider } = useWeb3React();

  return (
    <PageQueryContainer query={DEPOSIT_FORM_QUERY}>
      {(data) => <DepositForm />}
    </PageQueryContainer>
  );
};
