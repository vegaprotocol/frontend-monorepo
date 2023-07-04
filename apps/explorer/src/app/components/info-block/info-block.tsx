import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';

export interface InfoBlockProps {
  title: string;
  subtitle: string;
  tooltipInfo: string;
}

export const InfoBlock = ({ title, subtitle, tooltipInfo }: InfoBlockProps) => {
  return (
    <div className="flex flex-col text-center	">
      <h3 className="text-4xl">{title}</h3>
      <p className="text-vega-dark-100 dark:text-vega-light-200">
        {subtitle}
        {tooltipInfo ? (
          <Tooltip description={tooltipInfo} align="center">
            <span>
              <Icon
                name="info-sign"
                className="ml-2 text-vega-light-300 dark:text-vega-dark-300"
              />
            </span>
          </Tooltip>
        ) : undefined}
      </p>
    </div>
  );
};
