type NodeErrorProps = {
  headline?: string;
  message?: string;
};

export const NodeError = ({ headline, message }: NodeErrorProps) => {
  if (!headline && !message) {
    return null;
  }
  return (
    <div className="p-16 my-16 border border-danger">
      <p className="font-bold">{headline}</p>
      <p>{message}</p>
    </div>
  );
};
