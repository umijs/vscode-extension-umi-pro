import { Brackets } from './../../common/types';
import { IVscodeService, VscodeServiceToken } from '../../services/vscodeService';
import { Service, Inject } from 'typedi';
import * as vscode from 'vscode';
import { TextDocumentUtils } from '../../common/document';
import { DEFAULT_ROUTER_CONFIG_PATH } from '../../common/types';
import { join } from 'path';
import { isPathInRouter } from '../../common/ast';
import * as fs from 'mz/fs';

@Service()
export class UmiRouterDefinitionProvider implements vscode.DefinitionProvider {
  private vscodeService: IVscodeService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.vscodeService = vscodeService;
  }

  async provideDefinition(document: vscode.TextDocument, position: vscode.Position) {
    const filePath = document.uri.fsPath;
    const textDocumentUtils = new TextDocumentUtils(document);
    const config = this.vscodeService.getConfig(filePath);
    if (!config) {
      return;
    }
    const projectPath = this.vscodeService.getProjectPath(filePath);
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
    const codeRange = textDocumentUtils.growBracketsRange(range, Brackets.CURLY);
    if (!codeRange) {
      return;
    }
    if (!isPathInRouter(document.getText(codeRange), routePath, config.parserOptions)) {
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
        return new vscode.Location(vscode.Uri.file(pagePath), new vscode.Position(0, 9));
      }
    }
  }
}
