import { Inject, Service } from 'typedi';
import {
  IModelInfoService,
  ModelInfoServiceToken,
} from '../../services/modelInfoService';
import {
  IVscodeService,
  VscodeServiceToken,
} from '../../services/vscodeService';
import * as vscode from 'vscode';
import { TextDocumentUtils } from '../../common/document';

@Service()
export class ActionTypeDefinitionProvider implements vscode.DefinitionProvider {
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

  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const filePath = document.uri.fsPath;

    const textDocumentUtils = new TextDocumentUtils(document);
    const config = this.vscodeService.getConfig(filePath);
    if (!config) {
      return;
    }
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
    for (let model of models) {
      if (model.namespace === actionNameSpace) {
        let actionFunction =
          model.effects[actionFunctionName] ||
          model.reducers[actionFunctionName];
        if (actionFunction) {
          const targetRange = new vscode.Range(
            new vscode.Position(
              actionFunction.loc.start.line - 1,
              actionFunction.loc.start.column
            ),
            new vscode.Position(
              actionFunction.loc.end.line - 1,
              actionFunction.loc.end.column
            )
          );
          return [
            {
              originSelectionRange: range,
              targetUri: vscode.Uri.file(model.filePath),
              targetRange,
            },
          ];
        }
      }
    }
  }
}
