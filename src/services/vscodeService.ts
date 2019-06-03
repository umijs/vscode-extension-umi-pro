import { ILogger } from './../common/logger';
import { IUmiProConfig, QuoteType } from './../common/types';
import { Service, Token, Inject } from 'typedi';
import * as vscode from 'vscode';
import { isEqual } from 'lodash';
import { LoggerService } from '../common/logger';

export interface IVscodeService {
  getConfig(filePath: string): IUmiProConfig | null;

  getWorkspace(filePath: string): vscode.WorkspaceFolder | null;

  getProjectPath(filePath: string): string | null;

  init(props?: IVscodeServiceInitProps): Promise<void>;
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

export const VscodeServiceToken = new Token<IVscodeService>();

export interface IVscodeServiceInitProps {
  workspaceFolders: vscode.WorkspaceFolder[];
  workspaceConfigurations: vscode.WorkspaceConfiguration[];
}

@Service(VscodeServiceToken)
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _VscodeService implements IVscodeService {
  private workspaceFolders: vscode.WorkspaceFolder[];
  private workspaceConfigurations: vscode.WorkspaceConfiguration[];
  private logger: ILogger;

  constructor(
    @Inject(LoggerService)
    logger: ILogger
  ) {
    this.workspaceFolders = [];
    this.workspaceConfigurations = [];
    this.logger = logger;
    this.logger.info('init VscodeService');
  }

  async init(props?: IVscodeServiceInitProps) {
    let workspaceFolders: vscode.WorkspaceFolder[];
    let workspaceConfigurations: vscode.WorkspaceConfiguration[];
    if (!props) {
      workspaceFolders = eliminateSubWorkspaceFolder(vscode.workspace.workspaceFolders) || [];
      workspaceConfigurations = workspaceFolders.map(f =>
        vscode.workspace.getConfiguration(CONFIG_NAMESPACE, f.uri)
      );
    } else {
      ({ workspaceFolders, workspaceConfigurations } = props);
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
