import { t } from '@vegaprotocol/i18n';

export const Disclaimer = () => {
  return (
    <>
      <p className="mb-6 mt-4">
        {t(
          'Vega is a decentralised peer-to-peer protocol that can be used to create liquidity and trade derivatives of cryptocurrencies. The Vega Protocol is an implementation layer (layer one) protocol made of free, public, open-source or source-available software. Use of the Vega Protocol involves various risks, including but not limited to, losses while digital assets are being supplied to the Vega Protocol and losses due to the fluctuation of prices of assets. Before using the Vega Protocol, you should review the relevant documentation to make sure that you understand how it works. dditionally, just as you can access email protocols such as SMTP through multiple email clients, ou can potentially access the Vega Protocol through dozens of web or mobile interfaces. You are responsible for doing your own diligence on those interfaces to understand the associated risks and any fees.'
        )}
      </p>
      <p className="mb-6">
        {t(
          'As described in the Vega Protocol core license, the Vega Protocol is provided "as is", at your own risk, and without warranties of any kind. Although Gobalsky Labs Limited developed much of the initial code for the Vega Protocol, it does not provide or control the Vega Protocol, which is run by third parties deploying it on a bespoke blockchain. Upgrades and modifications to the Vega Protocol are managed in a community-driven way by holders of the VEGA governance token.'
        )}
      </p>
      <p className="mb-6">
        {t(
          'No developer or entity involved in creating the Vega Protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Vega Protocol, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or legal costs, or loss of profits, cryptocurrencies, tokens or anything else of value.'
        )}
      </p>
      <p className="mb-8">
        {t(
          'This website is not located on the world wide web and its data is not stored on servers - physical or virtual. It is located on a decentralised network, the Interplanetary File System ("IPFS"). The IPFS decentralised web is made up of all the computers (nodes) connected to it. Data is therefore stored on many different computers. No party is the operator or hoster of this website. The information provided on this website does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the website\'s content as such. No party recommends that any cryptocurrency asset should be bought, sold, or held by you via this website. Do conduct your own due diligence and consult our financial advisor before making any investment decisions.'
        )}
      </p>
    </>
  );
};
