import { Button } from '@vegaprotocol/ui-toolkit';

interface ButtonRadioProps<T> {
  name: string;
  options: Array<{ value: T; text: string }>;
  currentOption: T | null;
  onSelect: (option: T) => void;
}

export const ButtonRadio = <T extends string>({
  name,
  options,
  currentOption,
  onSelect,
}: ButtonRadioProps<T>) => {
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
