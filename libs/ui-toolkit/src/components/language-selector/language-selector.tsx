import { VegaIcon, VegaIconNames } from '../icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

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
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger data-testid="language-selector-trigger">
          <button className="flex justify-center items-center hover:bg-gs-500 p-1 rounded-full w-7 h-7">
            <VegaIcon name={VegaIconNames.GLOBE} size={16} />
          </button>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        {languages.map((language) => {
          return (
            <DropdownMenuItem
              key={language}
              data-testid={`language-selector-trigger-${language}`}
              onSelect={() => onSelect(language)}
            >
              {labels[language] || language}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
