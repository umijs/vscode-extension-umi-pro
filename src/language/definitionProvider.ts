import * as vscode from 'vscode';
import { TextDocumentUtils } from '../common/document';
import { getConfig } from './../common/config';
import { IModelInfoCache } from '../common/cache';
import { getProjectPath } from '../common/utils';

export default class DvaDefinitionProvider
  implements vscode.DefinitionProvider {
  private cache: IModelInfoCache;

  constructor(cache: IModelInfoCache) {
    this.cache = cache;
  }

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
    let actionType = textDocumentUtils.getWordInQuote(position, config.quotes);
    if (!actionType) {
      return;
    }
    const filePath = document.uri.fsPath;
    if (!actionType.includes('/')) {
      const namespace = this.cache.getCurrentNameSpace(filePath);
      if (!namespace) {
        return;
      }
      actionType = `${namespace}/${actionType}`;
    }
    const models = await this.cache.getModules(filePath, projectPath);
    const [actionNameSpace, actionFunctionName] = actionType.split('/');

    for (let model of models) {
      if (model.namespace === actionNameSpace) {
        let actionFunction = model.effects[actionFunctionName];
        if (!actionFunction) {
          actionFunction = model.reducers[actionFunctionName];
        }
        if (actionFunction) {
          return new vscode.Location(
            vscode.Uri.file(model.filePath),
            new vscode.Position(
              actionFunction.loc.start.line - 1,
              actionFunction.loc.start.column
            )
          );
        }
      }
    }
  }
}
