type NodeErrorProps = {
  headline?: string;
  message?: string;
};

export const NodeError = ({ headline, message }: NodeErrorProps) => {
  if (!headline && !message) {
    return null;
  }
  return (
    <div className="p-4 my-4 border border-danger">
      <p data-testid="node-error-type" className="font-bold">
        {headline}
      </p>
      <p data-testid="node-error-message">{message}</p>
    </div>
  );
};
