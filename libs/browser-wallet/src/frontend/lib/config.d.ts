declare module '!/config' {
  export interface Config {
    isTest: boolean;
    networks: Network[];
    feedbackLink: string;
    encryptionSettings: EncryptionSettings;
    closeWindowOnPopupOpen: boolean;
    sentryDsn: string | undefined;
    logging: boolean;
    userDataPolicy: string;
    features:
      | {
          [key: string]: boolean;
        }
      | undefined;
    autoOpenOnInstall: boolean;
  }

  export interface Network {
    name: string;
    rest: string[];
    console: string;
    explorer: string;
    ethereumExplorerLink: string;
    governance: string;
    docs: string;
    vegaDapps: string;
  }

  export interface EncryptionSettings {
    memory: number;
    iterations: number;
  }
  const config: Config;

  export default config;
}
