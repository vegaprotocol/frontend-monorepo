import { useTranslation } from "react-i18next";

import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../../../components/key-value-table";
import { formatNumber } from "../../../../lib/format-number";
import { useVoteInformation } from "../../hooks";
import { Proposals_proposals } from "../../proposals/__generated__/Proposals";

interface ProposalVotesTableProps {
  proposal: Proposals_proposals;
}

export const ProposalVotesTable = ({ proposal }: ProposalVotesTableProps) => {
  const { t } = useTranslation();
  const {
    willPass,
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    noTokens,
    yesTokens,
    yesVotes,
    noVotes,
    totalVotes,
    requiredMajorityPercentage,
    requiredParticipation,
    majorityMet,
  } = useVoteInformation({ proposal });

  return (
    <KeyValueTable
      title={t("voteBreakdown")}
      numerical={true}
      muted={true}
      data-testid="proposal-votes-table"
    >
      <KeyValueTableRow>
        <th>{t("willPass")}</th>
        <td>{willPass ? "👍" : "👎"}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("majorityMet")}</th>
        <td>{majorityMet ? "👍" : "👎"}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("participationMet")}</th>
        <td>{participationMet ? "👍" : "👎"}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("tokenForProposal")}</th>
        <td>{formatNumber(yesTokens, 2)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("tokensAgainstProposal")}</th>
        <td>{formatNumber(noTokens, 2)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("participationRequired")}</th>
        <td>{formatNumber(requiredParticipation)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("majorityRequired")}</th>
        <td>{formatNumber(requiredMajorityPercentage)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("numberOfVotingParties")}</th>
        <td>{formatNumber(totalVotes, 0)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("totalTokensVotes")}</th>
        <td>{formatNumber(totalTokensVoted, 2)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("totalTokenVotedPercentage")}</th>
        <td>{formatNumber(totalTokensPercentage, 2)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("numberOfForVotes")}</th>
        <td>{formatNumber(yesVotes, 0)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("numberOfAgainstVotes")}</th>
        <td>{formatNumber(noVotes, 0)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("yesPercentage")}</th>
        <td>{formatNumber(yesPercentage, 2)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("noPercentage")}</th>
        <td>{formatNumber(noPercentage, 2)}%</td>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
