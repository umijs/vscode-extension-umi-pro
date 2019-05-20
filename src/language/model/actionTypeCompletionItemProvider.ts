import { Inject, Service } from 'typedi';
import {
  IModelInfoService,
  ModelInfoServiceToken,
} from './../../services/modelInfoService';
import {
  IVscodeService,
  VscodeServiceToken,
} from './../../services/vscodeService';
import * as vscode from 'vscode';
import { quoteString } from '../../common/utils';
import logger from '../../common/logger';

@Service()
export class ActionTypeCompletionItemProvider
  implements vscode.CompletionItemProvider {
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
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const filePath = document.uri.fsPath;
    const userConfig = this.vscodeService.getConfig(filePath);
    if (!userConfig) {
      return;
    }
    const lineText = document.getText(
      new vscode.Range(position.with(position.line, 0), position)
    );
    logger.info(`current line ${lineText}`);
    //todo 更智能的判断
    if (!lineText.includes('type')) {
      return [];
    }
    let dvaModels = await this.modelInfoService.getModules(filePath);
    const currentNamespace = await this.modelInfoService.getNameSpace(filePath);
    const completionItems: vscode.CompletionItem[] = [];

    dvaModels.reduce(
      (previousValue, currentValue) => {
        let namespace;
        if (currentValue.namespace === currentNamespace) {
          namespace = '/';
        } else {
          namespace = `${currentValue.namespace}/`;
        }
        Object.keys(currentValue.effects).forEach(key => {
          const snippetCompletion = new vscode.CompletionItem(
            quoteString(`${namespace}${key}`, userConfig.quotes)
          );
          snippetCompletion.documentation = new vscode.MarkdownString(
            `\`\`\`typescript\n${currentValue.effects[key].code}\`\`\``
          );
          if (namespace === '/') {
            snippetCompletion.insertText =
              snippetCompletion.label[0] + snippetCompletion.label.slice(2);
          }
          previousValue.push(snippetCompletion);
        });
        Object.keys(currentValue.reducers).forEach(key => {
          const snippetCompletion = new vscode.CompletionItem(
            quoteString(`${namespace}${key}`, userConfig.quotes)
          );
          snippetCompletion.documentation = new vscode.MarkdownString(
            `\`\`\`typescript\n${currentValue.reducers[key].code}\`\`\``
          );
          if (namespace === '/') {
            snippetCompletion.insertText =
              snippetCompletion.label[0] + snippetCompletion.label.slice(2);
          }
          previousValue.push(snippetCompletion);
        });
        return previousValue;
      },

      completionItems
    );

    return completionItems;
  }
}
