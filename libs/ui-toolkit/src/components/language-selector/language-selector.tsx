import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItem,
  TradingDropdownTrigger,
} from '../trading-dropdown';

const Globe = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 1.248C14.1265 1.248 16.2053 1.87859 17.9735 3.06004C19.7417 4.24148 21.1198 5.92072 21.9336 7.88539C22.7474 9.85006 22.9603 12.0119 22.5454 14.0976C22.1305 16.1833 21.1065 18.0991 19.6028 19.6028C18.0991 21.1065 16.1833 22.1305 14.0976 22.5454C12.0119 22.9603 9.85006 22.7473 7.88539 21.9336C5.92072 21.1198 4.24149 19.7416 3.06004 17.9735C1.8786 16.2053 1.248 14.1265 1.248 12C1.25055 9.14917 2.38416 6.41584 4.4 4.39999C6.41584 2.38415 9.14918 1.25054 12 1.248ZM12 0C9.62663 0 7.30655 0.703786 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.91345 7.4078C0.00519871 9.60051 -0.23244 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0866C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6935 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2349 1.26428 15.1826 0 12 0Z"
      fill="currentColor"
    ></path>
    <path
      d="M12 1.248C14.592 1.248 16.5312 6.9312 16.5312 12C16.5312 17.0688 14.6112 22.752 12 22.752C9.38879 22.752 7.46879 17.0784 7.46879 12C7.46879 6.9216 9.40799 1.248 12 1.248ZM12 0C8.81279 0 6.23999 5.376 6.23999 12C6.23999 18.624 8.83199 24 12 24C15.168 24 17.76 18.6336 17.76 12C17.76 5.3664 15.168 0 12 0Z"
      fill="currentColor"
    ></path>
    <path
      d="M1.229 7.64001H22.7714"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeMiterlimit="10"
    ></path>
    <path
      d="M1.229 16.36H22.7714"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeMiterlimit="10"
    ></path>
  </svg>
);

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
          <button>
            <Globe />
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
