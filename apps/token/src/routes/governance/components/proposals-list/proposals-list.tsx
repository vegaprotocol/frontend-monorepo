import "./proposals-list.scss";

import { format, isFuture } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";

import { Heading } from "../../../../components/heading";
import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../../../components/key-value-table";
import { DATE_FORMAT_DETAILED } from "../../../../lib/date-formats";
import { getProposalName } from "../../../../lib/type-policies/proposal";
import { Proposals_proposals } from "../../proposals/__generated__/Proposals";
import { CurrentProposalState } from "../current-proposal-state";

interface ProposalsListProps {
  proposals: Proposals_proposals[];
}

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const match = useRouteMatch();

  if (proposals.length === 0) {
    return <p>{t("noProposals")}</p>;
  }

  const renderRow = (proposal: Proposals_proposals) => {
    return (
      <li key={proposal.id}>
        <Link to={`${match.url}/${proposal.id}`}>
          <header className="proposals-list__item-header">
            <p className="proposals-list__item-change">
              {getProposalName(proposal.terms.change)}
            </p>
          </header>
        </Link>
        <KeyValueTable muted={true}>
          <KeyValueTableRow>
            <th>{t("state")}</th>
            <td data-testid="governance-proposal-state">
              <CurrentProposalState proposal={proposal} />
            </td>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <th>
              {isFuture(new Date(proposal.terms.closingDatetime))
                ? t("closesOn")
                : t("closedOn")}
            </th>
            <td data-testid="governance-proposal-closingDate">
              {format(
                new Date(proposal.terms.closingDatetime),
                DATE_FORMAT_DETAILED
              )}
            </td>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <th>
              {isFuture(new Date(proposal.terms.enactmentDatetime))
                ? t("proposedEnactment")
                : t("enactedOn")}
            </th>
            <td data-testid="governance-proposal-enactmentDate">
              {format(
                new Date(proposal.terms.enactmentDatetime),
                DATE_FORMAT_DETAILED
              )}
            </td>
          </KeyValueTableRow>
        </KeyValueTable>
      </li>
    );
  };

  return (
    <>
      <Heading title={t("pageTitleGovernance")} />
      <p>{t("proposedChangesToVegaNetwork")}</p>
      <p>{t("vegaTokenHoldersCanVote")}</p>
      <p>{t("requiredMajorityDescription")}</p>
      <h2>{t("proposals")}</h2>
      <ul className="proposals-list">
        {proposals.map((row) => renderRow(row))}
      </ul>
    </>
  );
};
