import { LocaleParserToken, ILocaleParser } from './parser/localeParser';
import { VscodeServiceToken, IVscodeService } from './vscodeService';
import { LoggerService, ILogger } from './../common/logger';
import { join } from 'path';
import { existsSync } from 'fs';
import * as vscode from 'vscode';
import { Service, Inject, Token } from 'typedi';
import { IUmiProConfig, ILocale } from '../common/types';

export interface ILocaleService {
  getKeys(filePath: string): string[];
  getLocaleAst(filePath: string): ILocale[];
  initLocales(): void;
  updateFile(filePath: string): void;
  deleteFile(filePath: string): void;
  getValidLocaleFile(filePath: string): string | undefined;
}

export const LocaleServiceToken = new Token<ILocaleService>();

@Service(LocaleServiceToken)
export class LocaleService implements ILocaleService {
  public readonly vscodeService: IVscodeService;
  private data: {
    [projectPath: string]: ILocale[];
  };
  private projectPath: string;
  private config: IUmiProConfig | null;
  private logger: ILogger;
  private parser: ILocaleParser;

  constructor(
    @Inject(LoggerService)
    logger: ILogger,
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService,
    @Inject(LocaleParserToken)
    localeParser: ILocaleParser
  ) {
    this.logger = logger;
    this.logger.info('create ModelInfoService');
    this.vscodeService = vscodeService;
    this.parser = localeParser;
    this.data = {};
    this.projectPath = '';
    this.config = null;
  }

  public getKeys = (filePath: string) => {
    const projectPath = this.vscodeService.getProjectPath(filePath);
    if (!projectPath) {
      return [];
    }
    return this.data[projectPath].map(r => r.key);
  };

  public getLocaleAst = (filePath: string) => {
    const projectPath = this.vscodeService.getProjectPath(filePath);
    if (!projectPath) {
      return [];
    }
    return this.data[projectPath];
  };

  public initLocales = async () => {
    const folders = vscode.workspace.workspaceFolders;

    if (!folders) {
      return;
    }

    folders
      .map(f => this.getValidLocaleFile(f.uri.fsPath))
      .filter((f): f is string => !!f)
      .forEach(async f => {
        await this.updateFile(f);
      });
  };

  /**
   * @param {string} filePath only changed while specfied locale file modified
   */
  public updateFile = async (filePath: string) => {
    try {
      const localeFile = this.isValidLocaleFile(filePath);
      if (!localeFile) {
        return;
      }

      const result = await this.parser.parseFile(filePath);
      this.data[this.projectPath] = result;
    } catch (error) {
      this.logger.info(error.message);
    }
  };

  public deleteFile = async (filePath: string) => {
    const localeFile = this.isValidLocaleFile(filePath);
    if (!localeFile) {
      return;
    }

    delete this.data[this.projectPath];
  };

  public getValidLocaleFile(filePath: string) {
    return this.getLocaleFiles(filePath).find(l => existsSync(l));
  }

  private isValidLocaleFile(filePath: string) {
    return this.getLocaleFiles(filePath).some(f => filePath.endsWith(f));
  }

  private getLocaleFiles(filePath: string) {
    const config = this.vscodeService.getConfig(filePath);
    const projectPath = this.vscodeService.getProjectPath(filePath);
    if (!config || !projectPath) {
      return [];
    }
    this.config = config;
    this.projectPath = projectPath;
    return [
      join(this.projectPath, 'src', 'locales', `${this.config.locale}.js`),
      join(this.projectPath, 'src', 'locales', `${this.config.locale}.ts`),
      join(this.projectPath, 'src', 'locale', `${this.config.locale}.js`),
      join(this.projectPath, 'src', 'locale', `${this.config.locale}.ts`),
    ];
  }
}
