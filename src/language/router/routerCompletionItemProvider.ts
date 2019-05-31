import { RouterInfoServiceToken, RouterInfoService } from './../../services/routerService';
import { Inject, Service } from 'typedi';
import { IVscodeService, VscodeServiceToken } from '../../services/vscodeService';
import { TextDocumentUtils } from '../../common/document';
import { join } from 'path';
import * as vscode from 'vscode';
import { DEFAULT_ROUTER_CONFIG_PATH } from '../../common/types';

@Service()
export class UmiRouterCompletionItemProvider implements vscode.CompletionItemProvider {
  private vscodeService: IVscodeService;
  private routerInfoService: RouterInfoService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService,
    @Inject(RouterInfoServiceToken)
    routerInfoService: RouterInfoService
  ) {
    this.vscodeService = vscodeService;
    this.routerInfoService = routerInfoService;
  }

  async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const filePath = document.uri.fsPath;
    const textDocumentUtils = new TextDocumentUtils(document);
    const config = this.vscodeService.getConfig(filePath);
    const projectPath = this.vscodeService.getProjectPath(filePath);
    if (!projectPath || !config) {
      return;
    }
    const routerPath = config.routerConfigPath
      ? [config.routerConfigPath]
      : DEFAULT_ROUTER_CONFIG_PATH;
    if (routerPath.every(o => join(projectPath, o) !== document.uri.fsPath)) {
      return;
    }
    let range = textDocumentUtils.getQuoteRange(position, config.quotes);
    if (!range) {
      return;
    }
    let routePath = document.getText(range).slice(1, -1);
    const pages = await this.routerInfoService.getAllPages(
      join(projectPath, 'src/pages', routePath)
    );
    return pages.map(o => new vscode.CompletionItem(o));
  }
}
