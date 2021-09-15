import "./callout.scss";

export const Callout = ({
  children,
  title,
  intent,
  icon,
}: {
  children: React.ReactNode;
  title?: string;
  intent?: "success" | "error" | "warn";
  icon?: React.ReactNode;
}) => {
  const className = ["callout", intent ? `callout--${intent}` : ""].join(" ");
  return (
    <div data-testid="callout" className={className}>
      {icon && <div className="callout__icon">{icon}</div>}
      <div className="callout__content">
        {title && <h3 className="callout__title">{title}</h3>}
        {children}
      </div>
    </div>
  );
};
