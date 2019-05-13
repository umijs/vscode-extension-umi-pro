import * as vscode from 'vscode';
import { TextDocumentUtils, Brackets } from '../common/document';
import { getConfig, DEFAULT_ROUTER_CONFIG_PATH } from './../common/config';
import { getProjectPath } from './../common/utils';
import { join } from 'path';
import { isPathInRouter } from '../common/ast';
import * as fs from 'mz/fs';

export default class UmiRouterDefinitionProvider
  implements vscode.DefinitionProvider {
  async provideDefinition(
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
      : DEFAULT_ROUTER_CONFIG_PATH;
    if (routerPath.every(o => join(projectPath, o) !== document.uri.fsPath)) {
      return;
    }
    let range = textDocumentUtils.getQuoteRange(position, config.quotes);
    if (!range) {
      return;
    }
    let routePath = document.getText(range).slice(1, -1);
    const codeRange = textDocumentUtils.growBracketsRange(
      range,
      Brackets.CURLY
    );
    if (!codeRange) {
      return;
    }
    if (!isPathInRouter(document.getText(codeRange), routePath)) {
      return;
    }
    const possiblePagePath = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '/index.js',
      '/index.jsx',
      '/index.ts',
      '/index.tsx',
    ].map(prefix => join(projectPath, 'src/pages', `${routePath}${prefix}`));

    for (const pagePath of possiblePagePath) {
      if (await fs.exists(pagePath)) {
        return new vscode.Location(
          vscode.Uri.file(pagePath),
          new vscode.Position(0, 9)
        );
      }
    }
  }
}
