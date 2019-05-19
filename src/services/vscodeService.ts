import { Service } from 'typedi';
import * as vscode from 'vscode';

export enum QuoteType {
  double = 'double',
  single = 'single',
  backtick = 'backtick',
}

export interface IUmiProConfig {
  quotes: QuoteType;
  routerConfigPath?: string;
}

export const DEFAULT_ROUTER_CONFIG_PATH = [
  '.umirc.js',
  'config/config.js',
  'config/router.config.js',
];

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
  const workspaceFolders = eliminateSubWorkspaceFolder(
    vscode.workspace.workspaceFolders
  );
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

export async function loadVscodeService(service: VscodeService) {
  const {
    workspaceFolders,
    workspaceConfigurations,
  } = await getVscodeServiceArgs();
  service.load(workspaceFolders, workspaceConfigurations);
}

@Service()
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
    const index = this.workspaceFolders.findIndex(o =>
      o.uri.fsPath.startsWith(filePath)
    );
    if (index === -1) {
      return null;
    }
    const userConfig = this.workspaceConfigurations[index];

    const config: IUmiProConfig = {
      quotes: QuoteType.single,
      routerConfigPath: userConfig.get<string>('router_config_path'),
    };
    const userQuotesConfig = userConfig.get<QuoteType>('quotes');
    if (
      userQuotesConfig &&
      Object.values(QuoteType).includes(userQuotesConfig)
    ) {
      config.quotes = userQuotesConfig;
    }
    return config;
  }

  getWorkspace(filePath: string) {
    const workspaceFolder = this.workspaceFolders.find(o =>
      filePath.startsWith(o.uri.fsPath)
    );
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
