import { ParserOptions } from '@babel/parser';
import { SourceLocation } from '@babel/types';

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
  parserOptions: ParserOptions;
  routerExcludePath: string[];
}

export const DEFAULT_ROUTER_CONFIG_PATH = [
  '.umirc.js',
  '.umirc.ts',
  'config/config.js',
  'config/router.config.js',
];

interface CodeWithLoc {
  code: string;
  loc: {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  };
}

export interface IDvaModel {
  namespace: string;
  effects: {
    [name: string]: CodeWithLoc;
  };
  reducers: {
    [name: string]: CodeWithLoc;
  };
}

export interface IDvaModelWithFilePath extends IDvaModel {
  filePath: string;
}

export interface IUmirc {
  key: string;
  loc: SourceLocation;
  start: number;
  end: number;
}

export enum Brackets {
  ROUND = '()',
  BOX = '[]',
  CURLY = '{}',
}

export const JS_EXT_NAMES = ['.js', '.jsx', '.ts', '.tsx'];

export const EXCLUDE_EXT_NAMES = ['.d.ts', '.test.js', '.test.jsx', '.test.ts', '.test.tsx'];

export const SUPPORT_LANGUAGE = ['javascript', 'typescript', 'typescriptreact'];
