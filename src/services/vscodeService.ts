import { IUmiProConfig, QuoteType } from './../common/types';
import { Service, Token } from 'typedi';
import * as vscode from 'vscode';
import { isEqual } from 'lodash';

export interface IVscodeService {
  getConfig(filePath: string): IUmiProConfig | null;

  getWorkspace(filePath: string): vscode.WorkspaceFolder | null;

  getProjectPath(filePath: string): string | null;

  load(
    workspaceFolders: vscode.WorkspaceFolder[] | null,
    workspaceConfigurations: vscode.WorkspaceConfiguration[] | null
  ): void;
}

const CONFIG_NAMESPACE = 'umi_pro';

/**
 *
 * Todo 消除重复的目录
 *
 * @param workspaceFolders 项目的目录
 *
 */
export function eliminateSubWorkspaceFolder(
  workspaceFolders: vscode.WorkspaceFolder[] | undefined
) {
  return workspaceFolders;
}

export async function getVscodeServiceArgs() {
  const workspaceFolders = eliminateSubWorkspaceFolder(vscode.workspace.workspaceFolders);
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return {
      workspaceFolders: null,
      workspaceConfigurations: null,
    };
  }
  const workspaceConfigurations = workspaceFolders.map(f =>
    vscode.workspace.getConfiguration(CONFIG_NAMESPACE, f.uri)
  );
  return { workspaceFolders, workspaceConfigurations };
}

export async function loadVscodeService(service: IVscodeService) {
  const { workspaceFolders, workspaceConfigurations } = await getVscodeServiceArgs();
  service.load(workspaceFolders, workspaceConfigurations);
}

export const VscodeServiceToken = new Token<IVscodeService>();

@Service(VscodeServiceToken)
export class VscodeService implements IVscodeService {
  private workspaceFolders: vscode.WorkspaceFolder[];
  private workspaceConfigurations: vscode.WorkspaceConfiguration[];

  constructor() {
    this.workspaceFolders = [];
    this.workspaceConfigurations = [];
  }

  load(
    workspaceFolders: vscode.WorkspaceFolder[] | null,
    workspaceConfigurations: vscode.WorkspaceConfiguration[] | null
  ) {
    if (!workspaceConfigurations || !workspaceFolders) {
      this.workspaceFolders = [];
      this.workspaceConfigurations = [];
      return;
    }
    this.workspaceFolders = workspaceFolders;
    this.workspaceConfigurations = workspaceConfigurations;
  }

  getConfig(filePath: string) {
    const index = this.workspaceFolders.findIndex(o => filePath.startsWith(o.uri.fsPath));
    if (index === -1) {
      return null;
    }
    const userConfig = this.workspaceConfigurations[index];
    const config: IUmiProConfig = {
      quotes: QuoteType.single,
      routerConfigPath: userConfig.get<string>('router_config_path'),
      routerExcludePath: userConfig.get<string[]>('router_exclude_path') || [],
      parserOptions: {
        sourceType: 'module',
        plugins: [
          'typescript',
          'classProperties',
          'dynamicImport',
          'jsx',
          [
            'decorators',
            {
              decoratorsBeforeExport: true,
            },
          ],
        ],
      },
    };
    const userQuotesConfig = userConfig.get<QuoteType>('quotes');
    if (userQuotesConfig && Object.values(QuoteType).includes(userQuotesConfig)) {
      config.quotes = userQuotesConfig;
    }
    const parserOptions = userConfig.get<IUmiProConfig['parserOptions']>('parser_options');
    if (parserOptions && !isEqual(parserOptions, {})) {
      config.parserOptions = parserOptions;
    }
    return config;
  }

  getWorkspace(filePath: string) {
    const workspaceFolder = this.workspaceFolders.find(o => filePath.startsWith(o.uri.fsPath));
    if (!workspaceFolder) {
      return null;
    }
    return workspaceFolder;
  }

  getProjectPath(filePath: string) {
    const workspaceFolder = this.getWorkspace(filePath);
    if (!workspaceFolder) {
      return null;
    }
    return workspaceFolder.uri.fsPath;
  }
}
