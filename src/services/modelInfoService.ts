import { VscodeServiceToken, IVscodeService } from './vscodeService';
import { LoggerService, ILogger } from './../common/logger';
import { IDvaModelWithFilePath } from './../common/parser/interface';
import { join } from 'path';
import * as lodash from 'lodash';
import { Service, Container, Inject } from 'typedi';
import { ModelCache } from '../common/cache';
import { getModels, getPageModels } from '../common/utils';

export interface IModelInfoService {
  getModules(filePath: string): Promise<IDvaModelWithFilePath[]>;

  getNameSpace(filePath: string): Promise<string | null>;
}

@Service()
export class ModelInfoService implements IModelInfoService {
  private cache: ModelCache;
  private logger: ILogger;
  private vscodeService: IVscodeService;

  constructor(
    @Inject(LoggerService)
    logger: ILogger,
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.cache = Container.get<ModelCache>('ModelCache');
    this.logger = logger;
    this.vscodeService = vscodeService;
  }

  getModules = async (filePath: string) => {
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

  getNameSpace = async (filePath: string): Promise<string | null> => {
    const dvaModels = await this.cache.get(filePath);
    if (!dvaModels || dvaModels.length !== 1) {
      return null;
    }
    return dvaModels[0].namespace;
  };

  private async fileToModels(filePath) {
    const models = await this.cache.get(filePath);
    return models ? models.map(model => ({ ...model, filePath })) : null;
  }
}
