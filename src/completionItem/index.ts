import * as vscode from 'vscode';
import ModelInfoCache from '../common/cache';

class DvaCompletionItemProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const lineText = document.getText(
      new vscode.Range(position.with(position.line, 0), position)
    );
    //todo 更智能的判断
    if (!lineText.includes('type')) {
      return [];
    }
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return [];
    }
    const filePath = document.uri.fsPath;
    const workspace = workspaceFolders.find(o =>
      filePath.startsWith(o.uri.fsPath)
    );
    if (!workspace) {
      return [];
    }
    const projectPath = workspace.uri.fsPath;
    let dvaModels = ModelInfoCache.getAllModules(projectPath);
    if (!dvaModels) {
      dvaModels = await ModelInfoCache.loadProject(projectPath);
    }
    const currentNamespace = ModelInfoCache.getCurrentNameSpace(
      projectPath,
      filePath
    );

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
            `'${namespace}${key}'`
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
            `'${namespace}${key}'`
          );
          snippetCompletion.documentation = new vscode.MarkdownString(
            `\`\`\`typescript\n${currentValue.reducers[key].code}\`\`\``
          );
          previousValue.push(snippetCompletion);
        });
        return previousValue;
      },

      completionItems
    );

    return completionItems;
  }
}

export default DvaCompletionItemProvider;
