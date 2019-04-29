import * as vscode from 'vscode';
import ModelInfoCache from '../common/cache';

class DvaCompletionItemProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(document: vscode.TextDocument) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return [];
    }
    const filePath = document.uri.fsPath;
    const workspace = workspaceFolders.find(o =>
      filePath.startsWith(o.uri.fsPath)
    );
    if (!workspace) {
      return;
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
          previousValue.push(
            new vscode.CompletionItem(
              `'${namespace}${key}'`,
              vscode.CompletionItemKind.Text
            )
          );
        });
        Object.keys(currentValue.reducers).forEach(key => {
          previousValue.push(
            new vscode.CompletionItem(
              `'${namespace}${key}'`,
              vscode.CompletionItemKind.Text
            )
          );
        });
        return previousValue;
      },

      completionItems
    );

    return completionItems;
  }

  resolveCompletionItem(item: vscode.CompletionItem) {
    if (item.label.startsWith(`'/`)) {
      return new vscode.CompletionItem(
        item.label[0] + item.label.slice(2),
        vscode.CompletionItemKind.Text
      );
    }
    return null;
  }
}

export default DvaCompletionItemProvider;
