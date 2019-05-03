import { IDvaModel } from './../parser/interface';
import { join } from 'path';
import * as fs from 'mz/fs';
import { DvaModelParser } from '../parser';
import logger from '../logger';
import { getModels } from '../utils';

interface Cache {
  /**
   * 所有文件的编译缓存 IDvaModel
   */
  center: {
    [filePath: string]: IDvaModel[];
  };
  projects: {
    /**
     * key 为项目根路径
     */
    [projectPath: string]: {
      globalModels: string[];
    };
  };
}

interface IModelInfoCache {
  reloadFile(path: string): void;

  getModules(projectPath: string): Promise<IDvaModel[]>;

  getCurrentNameSpace(filePath: string): string | null;
}

class ModelInfoCache implements IModelInfoCache {
  private cache: Cache;
  private parser: DvaModelParser;

  constructor() {
    this.cache = {
      center: {},
      projects: {},
    };
    this.parser = new DvaModelParser();
  }
  async reloadFile(filePath: string) {
    this.cache.center[filePath] = [];
    await this.loadFile(filePath);
  }

  getModules = async (projectPath: string): Promise<IDvaModel[]> => {
    const project = this.cache.projects[projectPath];
    if (!project) {
      logger.info(`load project ${projectPath}`);
      const globalModels = await getModels(join(projectPath, 'src'));
      await Promise.all(globalModels.map(file => this.loadFile(file)));
      this.cache.projects[projectPath] = {
        globalModels,
      };
      return this.filesToModels(globalModels);
    }
    return this.filesToModels(project.globalModels);
  };

  getCurrentNameSpace(filePath: string): string | null {
    const dvaModels = this.cache.center[filePath];
    if (!dvaModels || dvaModels.length !== 1) {
      return null;
    }
    return dvaModels[0].namespace;
  }

  private filesToModels(files: string[]) {
    return files.reduce(
      (previousValue, filePath) => {
        const models = this.cache.center[filePath];
        if (Array.isArray(models)) {
          return previousValue.concat(this.cache.center[filePath]);
        }
        return previousValue;
      },
      [] as IDvaModel[]
    );
  }

  private async loadFile(filePath) {
    if (await fs.exists(filePath)) {
      try {
        this.cache.center[filePath] = await this.parser.parseFile(filePath);
      } catch (error) {
        logger.info(`解析文件失败 ${filePath}`);
        logger.info(error.message);
      }
    }
  }
}

export default new ModelInfoCache() as IModelInfoCache;
