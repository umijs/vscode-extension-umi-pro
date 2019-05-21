export enum QuoteType {
  double = 'double',
  single = 'single',
  backtick = 'backtick',
}

export const QuoteCharMap = {
  [QuoteType.single]: "'",
  [QuoteType.double]: '"',
  [QuoteType.backtick]: '`',
};

export interface IUmiProConfig {
  quotes: QuoteType;
  routerConfigPath?: string;
}

export const DEFAULT_ROUTER_CONFIG_PATH = [
  '.umirc.js',
  'config/config.js',
  'config/router.config.js',
];
