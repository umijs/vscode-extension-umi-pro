import * as vscode from 'vscode';

const CONFIG_NAMESPACE = 'umi_pro';

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

export interface IDvaHelperConfig {
  quotes: QuoteType;
  routerConfigPath?: string;
}

export const DEFAULT_ROUTER_CONFIG_PATH = [
  '.umirc.js',
  'config/config.js',
  'config/router.config.js',
];

export function getConfig(): IDvaHelperConfig {
  const userConfig = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
  const config: IDvaHelperConfig = {
    quotes: QuoteType.single,
    routerConfigPath: userConfig.get<string>('router_config_path'),
  };
  const userQuotesConfig = userConfig.get<QuoteType>('quotes');
  if (userQuotesConfig && Object.values(QuoteType).includes(userQuotesConfig)) {
    config.quotes = userQuotesConfig;
  }
  return config;
}
