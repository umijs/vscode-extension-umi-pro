import * as vscode from 'vscode';
import DvaCompletionItemProvider from './language/completionItem';
import DvaDefinitionProvider from './language/definitionProvider';
import DvaHoverProvider from './language/hoverProvider';
import UmiRouterDefinitionProvider from './language/router';
import { ModelInfoCache } from './common/cache';
import logger from './common/logger';
import { getUmiFileWatcher } from './common/fileWatcher';

export async function activate(context: vscode.ExtensionContext) {
  logger.info('extension "umi-pro" is now active!');
  const umiFileWatcher = await getUmiFileWatcher(
    vscode.workspace.workspaceFolders
  );
  if (!umiFileWatcher) {
    logger.info('no project use umi');
    return;
  }
  const modelInfoCache = new ModelInfoCache();
  umiFileWatcher.onDidChange(e => modelInfoCache.reloadFile(e.fsPath));
  umiFileWatcher.onDidCreate(e => modelInfoCache.reloadFile(e.fsPath));
  umiFileWatcher.onDidDelete(e => modelInfoCache.reloadFile(e.fsPath));

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      new DvaCompletionItemProvider(modelInfoCache),
      ':'
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ['javascript', 'typescript'],
      new DvaHoverProvider(modelInfoCache)
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      ['javascript', 'typescript'],
      new DvaDefinitionProvider(modelInfoCache)
    )
  );
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      ['javascript', 'typescript'],
      new UmiRouterDefinitionProvider()
    )
  );
}

export function deactivate() {}
