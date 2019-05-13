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
      : ['.umirc.js', 'config/config.js', 'config/config.js'];
    if (routerPath.every(o => join(projectPath, o) !== document.uri.fsPath)) {
      return;
    }
    let range = textDocumentUtils.getQuoteRange(position, config.quotes);
    if (!range) {
      return;
    }
    let routePath = document.getText(range).slice(1, -1);
    if (!routePath.startsWith('./')) {
      return;
    }
    const pages = await getAllPages(join(projectPath, 'src/pages'));

    console.log(pages);
    const result = pages
      .filter(o => o.startsWith(routePath.slice(2)))
      .map(o => new vscode.CompletionItem(o.slice(routePath.slice(2).length)));

    console.log(pages);
    return result;
  }
}
