import {
  IVscodeService,
  VscodeServiceToken,
} from '../../services/vscodeService';
import {
  ModelInfoServiceToken,
  IModelInfoService,
} from '../../services/modelInfoService';
import { TextDocumentUtils } from '../../common/document';
import logger from '../../common/logger';
import { Service, Inject } from 'typedi';

import * as vscode from 'vscode';

@Service()
export class ActionTypeHoverProvider implements vscode.HoverProvider {
  private vscodeService: IVscodeService;

  private modelInfoService: IModelInfoService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService,
    @Inject(ModelInfoServiceToken)
    modelInfoService: IModelInfoService
  ) {
    this.vscodeService = vscodeService;
    this.modelInfoService = modelInfoService;
  }

  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const filePath = document.uri.fsPath;
    const config = this.vscodeService.getConfig(filePath);
    if (!config) {
      return;
    }
    const textDocumentUtils = new TextDocumentUtils(document);
    let range = textDocumentUtils.getQuoteRange(position, config.quotes);
    if (!range) {
      return;
    }
    let actionType = document.getText(range).slice(1, -1);
    if (!actionType.includes('/')) {
      const namespace = await this.modelInfoService.getNameSpace(filePath);
      if (!namespace) {
        return;
      }
      actionType = `${namespace}/${actionType}`;
    }
    const models = await this.modelInfoService.getModules(filePath);
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
