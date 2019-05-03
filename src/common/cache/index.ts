import { IDvaModel } from './../parser/interface';
import { join } from 'path';
import * as fs from 'mz/fs';
import { DvaModelParser } from '../parser';
import logger from '../logger';
import { getModels, getPageModels } from '../utils';

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

export interface IModelInfoCache {
  reloadFile(path: string): void;

  getModules(filePath: string, projectPath: string): Promise<IDvaModel[]>;

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
    const projects = Object.keys(this.cache.projects);
    projects.forEach(key => {
      if (filePath.startsWith[key]) {
        const models = this.cache.projects[key];
        if (models.globalModels.every(path => path !== filePath)) {
          models.globalModels.push(filePath);
        }
      }
    });
  }

  getModules = async (filePath: string, projectPath: string) => {
    let project = this.cache.projects[projectPath];
    if (!project) {
      logger.info(`load project ${projectPath}`);
      project = {
        globalModels: await getModels(join(projectPath, 'src')),
      };
      this.cache.projects[projectPath] = project;
    }
    try {
      const pageModels = await getPageModels(filePath, projectPath);
      return this.filesToModels(project.globalModels.concat(pageModels));
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  getCurrentNameSpace(filePath: string): string | null {
    const dvaModels = this.cache.center[filePath];
    if (!dvaModels || dvaModels.length !== 1) {
      return null;
    }
    return dvaModels[0].namespace;
  }

  private async filesToModels(files: string[]) {
    await Promise.all(files.map(file => this.loadFile(file)));
    return files.reduce(
      (previousValue, filePath) => {
        const models = this.cache.center[filePath];
        if (Array.isArray(models)) {
          return previousValue.concat(models);
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
