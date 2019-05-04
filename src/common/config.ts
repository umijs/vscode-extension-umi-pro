import * as vscode from 'vscode';

const CONFIG_NAMESPACE = 'dva_helper';

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
}

export function getConfig(): IDvaHelperConfig {
  const config = { quotes: QuoteType.single };
  const userConfig = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
  const userQuotesConfig = userConfig.get<QuoteType>('quotes');
  if (userQuotesConfig && Object.values(QuoteType).includes(userQuotesConfig)) {
    config.quotes = userQuotesConfig;
  }
  return config;
}
