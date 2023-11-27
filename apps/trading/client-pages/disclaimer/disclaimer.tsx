import { useT } from '../../lib/use-t';

export const Disclaimer = () => {
  const t = useT();
  return (
    <>
      <h1 className="text-4xl uppercase xl:text-5xl font-alpha calt">
        {t('Disclaimer')}
      </h1>
      <p className="mt-10 mb-6">
        {t(
          'DISCLAIMER_P1',
          'Vega is a decentralised peer-to-peer protocol that can be used to trade derivatives with cryptoassets. The Vega Protocol is an implementation layer (layer one) protocol made of free, public, open-source or source-available software. Use of the Vega Protocol involves various risks, including but not limited to, losses while digital assets are supplied to the Vega Protocol and losses due to the fluctuation of prices of assets.'
        )}
      </p>
      <p className="mb-6">
        {t(
          'DISCLAIMER_P2',
          'Before using the Vega Protocol, review the relevant documentation at docs.vega.xyz to make sure that you understand how it works. Conduct your own due diligence and consult your financial advisor before making any investment decisions.'
        )}
      </p>
      <p className="mb-6">
        {t(
          'DISCLAIMER_P3',
          'As described in the Vega Protocol core license, the Vega Protocol is provided “as is”, at your own risk, and without warranties of any kind. Although Gobalsky Labs Limited developed much of the initial code for the Vega Protocol, it does not provide or control the Vega Protocol, which is run by third parties deploying it on a bespoke blockchain. Upgrades and modifications to the Vega Protocol are managed in a community-driven way by holders of the VEGA governance token.'
        )}
      </p>
      <p className="mb-8">
        {t(
          'DISCLAIMER_P4',
          'No developer or entity involved in creating the Vega Protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Vega Protocol, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or legal costs, or loss of profits, cryptoassets, tokens or anything else of value.'
        )}
      </p>
      <p className="mb-8">
        {t(
          'DISCLAIMER_P5',
          'This website is hosted on a decentralised network, the Interplanetary File System (“IPFS”). The IPFS decentralised web is made up of all the computers (nodes) connected to it. Data is therefore stored on many different computers.'
        )}
      </p>
      <p className="mb-8">
        {t(
          'DISCLAIMER_P6',
          "The information provided on this website does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the website's content as such. No party recommends that any cryptoasset should be bought, sold, or held by you via this website. No party ensures the accuracy of information listed on this website or holds any responsibility for any missing or wrong information. You understand that you are using any and all information available here at your own risk."
        )}
      </p>
      <p className="mb-8">
        {t(
          'DISCLAIMER_P7',
          'Additionally, just as you can access email protocols such as SMTP through multiple email clients, you can potentially access the Vega Protocol through many web or mobile interfaces. You are responsible for doing your own diligence on those interfaces to understand the associated risks and any fees.'
        )}
      </p>
    </>
  );
};
