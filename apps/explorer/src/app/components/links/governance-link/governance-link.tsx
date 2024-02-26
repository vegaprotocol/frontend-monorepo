import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ENV } from '../../../config/env';
import { t } from '@vegaprotocol/i18n';

export type GovernanceLinkProps = {
  text?: string;
};

/**
 * Just a link to the governance page, with optional text
 */
const GovernanceLink = ({ text = t('Goveranance') }: GovernanceLinkProps) => {
  const base = ENV.dataSources.governanceUrl;

  return <ExternalLink href={base}>{text}</ExternalLink>;
};

export default GovernanceLink;
