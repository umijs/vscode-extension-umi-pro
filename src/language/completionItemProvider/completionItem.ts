import * as vscode from 'vscode';
import { IModelInfoCache } from '../../common/cache';
import { getConfig } from '../../common/config';
import { quoteString, getProjectPath } from '../../common/utils';
import logger from '../../common/logger';

export default class DvaCompletionItemProvider
  implements vscode.CompletionItemProvider {
  private cache: IModelInfoCache;

  constructor(cache: IModelInfoCache) {
    this.cache = cache;
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const projectPath = getProjectPath(document);
    if (!projectPath) {
      return;
    }
    const filePath = document.uri.fsPath;
    const lineText = document.getText(
      new vscode.Range(position.with(position.line, 0), position)
    );
    logger.info(`current line ${lineText}`);
    //todo 更智能的判断
    if (!lineText.includes('type')) {
      return [];
    }
    let dvaModels = await this.cache.getModules(filePath, projectPath);
    const currentNamespace = await this.cache.getCurrentNameSpace(filePath);
    const completionItems: vscode.CompletionItem[] = [];
    const userConfig = getConfig();
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
