import { VegaIcon, VegaIconNames } from '../icon';
import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItem,
  TradingDropdownTrigger,
} from '../trading-dropdown';

const labels: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ru: 'Pусский',
  ko: '한국인',
  zh: '简体中文',
  vi: 'Tiếng Việt',
};

export const LanguageSelector = ({
  languages,
  onSelect,
}: {
  languages: readonly string[];
  onSelect: (selectedLanguage: string) => void;
}) => {
  return (
    <TradingDropdown
      trigger={
        <TradingDropdownTrigger data-testid="language-selector-trigger">
          <button className="flex justify-center items-center hover:bg-gs-500 p-1 rounded-full w-7 h-7">
            <VegaIcon name={VegaIconNames.GLOBE} size={16} />
          </button>
        </TradingDropdownTrigger>
      }
    >
      <TradingDropdownContent>
        {languages.map((language) => {
          return (
            <TradingDropdownItem
              key={language}
              data-testid={`language-selector-trigger-${language}`}
              onSelect={() => onSelect(language)}
            >
              {labels[language] || language}
            </TradingDropdownItem>
          );
        })}
      </TradingDropdownContent>
    </TradingDropdown>
  );
};
