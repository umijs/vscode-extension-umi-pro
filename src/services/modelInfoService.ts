import { IDvaModelWithFilePath, IDvaModel } from './../common/types';
import { DvaModelParser } from './../common/parser/index';
import { VscodeServiceToken, IVscodeService } from './vscodeService';
import { LoggerService, ILogger } from './../common/logger';
import { IDvaModelParser } from './../common/parser';
import { join } from 'path';
import * as lodash from 'lodash';
import { Service, Inject, Token } from 'typedi';
import { getModels, getPageModels } from '../common/utils';

export interface IModelInfoService {
  getModules(filePath: string): Promise<IDvaModelWithFilePath[]>;

  getNameSpace(filePath: string): Promise<string | null>;

  updateFile(filePath: string): void;
}

export const ModelInfoServiceToken = new Token<IModelInfoService>();

@Service(ModelInfoServiceToken)
export class ModelInfoService implements IModelInfoService {
  public readonly vscodeService: IVscodeService;
  private logger: ILogger;
  private data: {
    [filename: string]: IDvaModel[] | null;
  };
  private parser: IDvaModelParser;

  constructor(
    @Inject(LoggerService)
    logger: ILogger,
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.logger = logger;
    this.logger.info('create ModelInfoService');
    this.vscodeService = vscodeService;
    this.data = {};
    this.parser = new DvaModelParser();
  }

  public getModules = async (filePath: string) => {
    try {
      const projectPath = this.vscodeService.getProjectPath(filePath);
      if (!projectPath) {
        return [];
      }
      const globalModels = await getModels(join(projectPath, 'src'));
      const pageModels = await getPageModels(filePath, projectPath);
      const modelFiles = globalModels.concat(pageModels);
      return lodash.flatten(
        (await Promise.all(
          modelFiles.map(file => this.fileToModels(file))
        )).filter((o): o is IDvaModelWithFilePath[] => !!o)
      );
    } catch (error) {
      this.logger.info(error.message);
      return [];
    }
  };

  public getNameSpace = async (filePath: string): Promise<string | null> => {
    const dvaModels = await this.parserFile(filePath);
    if (!dvaModels || dvaModels.length !== 1) {
      return null;
    }
    return dvaModels[0].namespace;
  };

  public updateFile = async (filePath: string) => {
    this.data[filePath] = [];
  };

  private fileToModels = async filePath => {
    const models = await this.parserFile(filePath);
    return models ? models.map(model => ({ ...model, filePath })) : null;
  };

  private parserFile = async (filePath: string) => {
    const value = this.data[filePath];
    if (!value) {
      try {
        this.data[filePath] = await this.parser.parseFile(filePath);
      } catch (error) {
        this.logger.info(`解析文件失败 ${filePath}`);
        this.logger.info(error.message);
      }
    }
    return this.data[filePath];
  };
}
