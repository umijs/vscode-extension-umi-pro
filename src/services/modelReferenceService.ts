import { JS_EXT_NAMES } from './../common/types';
import { LoggerService, ILogger } from './../common/logger';
import { Location } from 'vscode';
import globby from 'globby';
import { flatten } from 'lodash';

import { Service, Inject, Token } from 'typedi';
import { IVscodeService, VscodeServiceToken } from './vscodeService';
import { IModelReferenceParser, ModelReferenceParserToken } from './parser/modelReferenceParser';
import { join } from 'path';
import { IModelInfoService, ModelInfoServiceToken } from './modelInfoService';

export interface IModelReferenceService {
  getReference(filePath: string, model: string, action: string): Promise<Location[]>;

  reloadFile(filePath: string): Promise<void>;
}

interface Action {
  namespace: string;
  action: string;
}
interface FileInfoCache {
  [filePath: string]: Action[];
}

interface ReferenceCache {
  [model: string]: {
    [action: string]: {
      [filePath: string]: Location[];
    };
  };
}

export const ModelReferenceServiceToken = new Token<IModelReferenceService>();

@Service(ModelReferenceServiceToken)
export default class ModelReferenceService implements IModelReferenceService {
  private modelReferenceParser: IModelReferenceParser;
  private modelReferenceMap: Map<string, ReferenceCache>;
  private projectFileModelsMap: Map<string, FileInfoCache>;
  private modelInfoService: IModelInfoService;
  private logger: ILogger;
  private vscodeService: IVscodeService;

  constructor(
    @Inject(LoggerService)
    logger: ILogger,
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService,
    @Inject(ModelInfoServiceToken)
    modelInfoService: IModelInfoService,
    @Inject(ModelReferenceParserToken)
    modelReferenceParser: IModelReferenceParser
  ) {
    this.vscodeService = vscodeService;
    this.logger = logger;
    this.modelReferenceMap = new Map<string, ReferenceCache>();
    this.projectFileModelsMap = new Map<string, FileInfoCache>();
    this.modelInfoService = modelInfoService;
    this.modelReferenceParser = modelReferenceParser;
  }

  async getReference(filePath: string, model: string, action: string) {
    const projectPath = this.vscodeService.getProjectPath(filePath);
    if (!projectPath) {
      return [];
    }
    if (!this.modelReferenceMap.has(projectPath)) {
      await this.loadProject(projectPath);
    }
    return flatten<Location>(Object.values(this.getActionReference(projectPath, model, action)));
  }

  async reloadFile(filePath: string) {
    const projectPath = this.vscodeService.getProjectPath(filePath);
    if (!projectPath) {
      return;
    }
    let fileModels = this.projectFileModelsMap.get(projectPath);
    if (!fileModels) {
      fileModels = {};
      this.projectFileModelsMap.set(projectPath, fileModels);
    }
    const previousFileModels = fileModels[filePath];
    if (previousFileModels && previousFileModels.length > 0) {
      previousFileModels.forEach(({ namespace, action }) => {
        this.getActionReference(projectPath, namespace, action)[filePath] = [];
      });
    }
    const modelReferences = await this.modelReferenceParser.parseFile(filePath);
    const currentNameSpace = await this.modelInfoService.getNameSpace(filePath);
    let actions: Action[] = [];
    modelReferences.forEach(({ uri, range, type }) => {
      let namespace;
      let action;
      if (type.includes('/')) {
        [namespace, action] = type.split('/');
      } else {
        [namespace, action] = [currentNameSpace, type];
      }
      actions.push({
        namespace,
        action,
      });
      const reference = this.getActionReference(projectPath, namespace, action)[filePath] || [];
      reference.push(new Location(uri, range));
      this.getActionReference(projectPath, namespace, action)[filePath] = reference;
    });
    fileModels[filePath] = actions;
  }
  private async loadProject(cwd: string) {
    const files = (await globby([`./src/**/*{${JS_EXT_NAMES.join(',')}}`, '!./node_modules/**'], {
      cwd,
      deep: true,
    })).filter(p =>
      ['.d.ts', '.test.js', '.test.jsx', '.test.ts', '.test.tsx'].every(ext => !p.endsWith(ext))
    );
    this.logger.info(`load project ${cwd} find ${files.length} files`);
    await Promise.all(files.map(file => this.reloadFile(join(cwd, file))));
    this.logger.info(`load project ${cwd} success`);
  }

  private getActionReference(
    projectPath: string,
    namespace: string,
    action: string
  ): {
    [filePath: string]: Location[];
  } {
    let project = this.modelReferenceMap.get(projectPath);
    if (!project) {
      project = {};
      this.modelReferenceMap.set(projectPath, project);
    }
    let modelReference;
    if (!project[namespace]) {
      project[namespace] = {};
    }
    modelReference = project[namespace];
    if (!modelReference[action]) {
      modelReference[action] = {};
    }
    return modelReference[action];
  }
}
