import { Button } from '@vegaprotocol/ui-toolkit';

interface ButtonRadioProps {
  name: string;
  options: Array<{ value: string; text: string }>;
  currentOption: string | null;
  onSelect: (option: string) => void;
}

export const ButtonRadio = ({
  name,
  options,
  currentOption,
  onSelect,
}: ButtonRadioProps) => {
  return (
    <div className="flex gap-8">
      {options.map((option) => {
        const isSelected = option.value === currentOption;
        return (
          <Button
            onClick={() => onSelect(option.value)}
            className="flex-1"
            variant={isSelected ? 'accent' : undefined}
            data-testid={
              isSelected
                ? `${name}-${option.value}-selected`
                : `${name}-${option.value}`
            }
            key={option.value}
          >
            {option.text}
          </Button>
        );
      })}
    </div>
  );
};
