import { format, isFuture } from "date-fns";
import { useTranslation } from "react-i18next";

import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../../../components/key-value-table";
import { DATE_FORMAT_DETAILED } from "../../../../lib/date-formats";
import { Proposals_proposals } from "../../proposals/__generated__/Proposals";
import { CurrentProposalState } from "../current-proposal-state";

interface ProposalChangeTableProps {
  proposal: Proposals_proposals;
}

export const ProposalChangeTable = ({ proposal }: ProposalChangeTableProps) => {
  const { t } = useTranslation();

  const terms = proposal.terms;

  return (
    <KeyValueTable muted={true} data-testid="proposal-change-table">
      <KeyValueTableRow>
        <th>{t("id")}</th>
        <td>{proposal.id}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("state")}</th>
        <td>
          <CurrentProposalState proposal={proposal} />
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>
          {isFuture(new Date(terms.closingDatetime))
            ? t("closesOn")
            : t("closedOn")}
        </th>
        <td>{format(new Date(terms.closingDatetime), DATE_FORMAT_DETAILED)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>
          {isFuture(new Date(terms.enactmentDatetime))
            ? t("proposedEnactment")
            : t("enactedOn")}
        </th>
        <td>
          {format(new Date(terms.enactmentDatetime), DATE_FORMAT_DETAILED)}
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("proposedBy")}</th>
        <td>
          <span style={{ wordBreak: "break-word" }}>{proposal.party.id}</span>
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("proposedOn")}</th>
        <td>{format(new Date(proposal.datetime), DATE_FORMAT_DETAILED)}</td>
      </KeyValueTableRow>
      {proposal.rejectionReason ? (
        <KeyValueTableRow>
          <th>{t("rejectionReason")}</th>
          <td>{proposal.rejectionReason}</td>
        </KeyValueTableRow>
      ) : null}
      {proposal.errorDetails ? (
        <KeyValueTableRow>
          <th>{t("errorDetails")}</th>
          <td>{proposal.errorDetails}</td>
        </KeyValueTableRow>
      ) : null}
      <KeyValueTableRow>
        <th>{t("type")}</th>
        <td>{proposal.terms.change.__typename}</td>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
