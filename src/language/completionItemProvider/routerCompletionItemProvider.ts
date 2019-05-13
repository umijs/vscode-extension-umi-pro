import { TextDocumentUtils } from './../../common/document';
import { join } from 'path';
import * as vscode from 'vscode';
import { getProjectPath, getAllPages } from '../../common/utils';
import { getConfig } from '../../common/config';

export class UmiRouterCompletionItemProvider
  implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const textDocumentUtils = new TextDocumentUtils(document);
    const config = getConfig();
    const projectPath = getProjectPath(document);
    if (!projectPath) {
      return;
    }
    const routerPath = config.routerConfigPath
      ? [config.routerConfigPath]
      : ['.umirc.js', 'config/config.js', 'config/router.config.js'];
    if (routerPath.every(o => join(projectPath, o) !== document.uri.fsPath)) {
      return;
    }
    let range = textDocumentUtils.getQuoteRange(position, config.quotes);
    if (!range) {
      return;
    }
    let routePath = document.getText(range).slice(1, -1);
    const pages = await getAllPages(join(projectPath, 'src/pages', routePath));
    return pages.map(o => new vscode.CompletionItem(o));
  }
}
