import { IDvaModelWithFilePath } from './../parser/interface';
import { join } from 'path';

import { getModels, getPageModels } from '../utils';
import { ModelCache } from './modelCache';
export * from './modelCache';

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

      const models = await Promise.all(
        globalModels.concat(pageModels).map(file => this.fileToModels(file))
      );
      const result: IDvaModelWithFilePath[] = [];
      models.forEach(o => {
        if (o) {
          result.push(...o);
        }
      });
      return result;
    } catch (error) {
      console.log(error);
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

  private async fileToModels(file): Promise<IDvaModelWithFilePath[] | null> {
    const models = await this.cache.get(file);
    if (!models) {
      return null;
    }
    return models.map(model => ({ ...model, filePath: file }));
  }
}
