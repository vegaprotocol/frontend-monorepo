export const ProposalLink = ({ id, text }: { id: string; text?: string }) => (
  <a href={`https://governance.fairground.wtf/proposals/${id}`}>{text || id}</a>
);
