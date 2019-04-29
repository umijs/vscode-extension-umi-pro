import { IDvaModel } from './../parser/interface';
import * as path from 'path';
import * as fs from 'mz/fs';
import { DvaModelParser } from '../parser';

interface Cache {
  [projectPath: string]: {
    [filePath: string]: IDvaModel[];
  };
}

interface IModelInfoCache {
  reloadFile(path: string): void;
}

class ModelInfoCache implements IModelInfoCache {
  private cache: Cache;

  constructor() {
    this.cache = {};
  }
  async reloadFile(filePath: string) {
    const projects = Object.keys(this.cache);
    const projectKey = projects.find(projectPath =>
      filePath.startsWith(projectPath)
    );
    if (projectKey) {
      const project = this.cache[projectKey];
      project[filePath] = [];
      const modules = await new DvaModelParser().parseFile(filePath);
      project[filePath] = modules;
    }
  }

  async loadProject(projectPath): Promise<IDvaModel[]> {
    const modulesRoot = path.resolve(projectPath, 'src', 'models');
    const files = fs.readdirSync(modulesRoot);
    const project: {
      [filePath: string]: IDvaModel[];
    } = {};
    await Promise.all(
      files.map(
        file =>
          new Promise(async r => {
            const modulesPath = path.resolve(modulesRoot, file);
            const modules = await new DvaModelParser().parseFile(modulesPath);
            project[modulesPath] = modules;
            r();
          })
      )
    );
    this.cache[projectPath] = project;
    return this.getAllModules(projectPath)!;
  }

  getAllModules(projectPath: string) {
    const project = this.cache[projectPath];
    if (!project) {
      return null;
    }
    return Object.values(project).reduce((previousValue, currentValue) => {
      return previousValue.concat(currentValue);
    }, []);
  }

  getCurrentNameSpace(projectPath: string, filePath: string): string | null {
    const project = this.cache[projectPath];
    if (!project) {
      return null;
    }
    const dvaModels = project[filePath];
    if (!dvaModels || dvaModels.length !== 1) {
      return null;
    }
    return dvaModels[0].namespace;
  }
}

export default new ModelInfoCache();
