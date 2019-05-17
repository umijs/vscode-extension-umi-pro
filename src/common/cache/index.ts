import { IDvaModelWithFilePath } from './../parser/interface';
import { join } from 'path';
import { getModels, getPageModels } from '../utils';
import { ModelCache } from './modelCache';
export * from './modelCache';
import * as lodash from 'lodash';
import logger from '../logger';

export interface IModelInfoCache {
  getModules(
    filePath: string,
    projectPath: string
  ): Promise<IDvaModelWithFilePath[]>;

  getCurrentNameSpace(filePath: string): Promise<string | null>;
}

export class ModelInfoCache implements IModelInfoCache {
  private cache: ModelCache;

  constructor(cache: ModelCache) {
    this.cache = cache;
  }

  getModules = async (filePath: string, projectPath: string) => {
    try {
      const globalModels = await getModels(join(projectPath, 'src'));
      const pageModels = await getPageModels(filePath, projectPath);
      const modelFiles = globalModels.concat(pageModels);
      return lodash.flatten(
        (await Promise.all(
          modelFiles.map(file => this.fileToModels(file))
        )).filter((o): o is IDvaModelWithFilePath[] => !!o)
      );
    } catch (error) {
      logger.info(error.message);
      return [];
    }
  };

  getCurrentNameSpace = async (filePath: string): Promise<string | null> => {
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
