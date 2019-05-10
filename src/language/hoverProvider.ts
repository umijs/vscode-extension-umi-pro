import { IModelInfoCache } from './../common/cache';
import { getProjectPath } from '../common/utils';
import { TextDocumentUtils } from './../common/document';
import { getConfig } from './../common/config';
import logger from '../common/logger';

import * as vscode from 'vscode';

export default class DvaHoverProvider implements vscode.HoverProvider {
  private cache: IModelInfoCache;

  constructor(cache: IModelInfoCache) {
    this.cache = cache;
  }

  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const projectPath = getProjectPath(document);
    if (!projectPath) {
      return;
    }
    const config = getConfig();
    const filePath = document.uri.fsPath;
    const textDocumentUtils = new TextDocumentUtils(document);
    let range = textDocumentUtils.getQuoteRange(position, config.quotes);
    if (!range) {
      return;
    }
    let actionType = document.getText(range).slice(1, -1);
    if (!actionType.includes('/')) {
      const namespace = this.cache.getCurrentNameSpace(filePath);
      if (!namespace) {
        return;
      }
      actionType = `${namespace}/${actionType}`;
    }
    const models = await this.cache.getModules(filePath, projectPath);
    const [actionNameSpace, actionFunctionName] = actionType.split('/');

    logger.info(`hover action ${actionType}`);

    for (let model of models) {
      if (model.namespace === actionNameSpace) {
        let actionFunction =
          model.effects[actionFunctionName] ||
          model.reducers[actionFunctionName];
        if (actionFunction) {
          return new vscode.Hover(
            {
              language: 'typescript',
              value: actionFunction.code,
            },
            range
          );
        }
      }
    }
  }
}
