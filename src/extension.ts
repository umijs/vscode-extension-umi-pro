import * as vscode from 'vscode';
import DvaCompletionItemProvider from './completionItem';
import ModelInfoCache from './common/cache';

export function activate(context: vscode.ExtensionContext) {
  console.log('extension "dva-helper" is now active!');

  const watcher = vscode.workspace.createFileSystemWatcher(
    '**/*',
    false,
    false,
    false
  );

  watcher.onDidChange(e => ModelInfoCache.reloadFile(e.fsPath));
  watcher.onDidCreate(e => ModelInfoCache.reloadFile(e.fsPath));
  watcher.onDidDelete(e => ModelInfoCache.reloadFile(e.fsPath));

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      new DvaCompletionItemProvider(ModelInfoCache),
      ':'
    )
  );
}

export function deactivate() {}
