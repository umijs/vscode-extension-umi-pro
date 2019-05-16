import * as vscode from 'vscode';
import DvaCompletionItemProvider from './language/completionItemProvider/completionItem';
import DvaDefinitionProvider from './language/definitionProvider';
import DvaHoverProvider from './language/hoverProvider';
import { UmiRouterCompletionItemProvider } from './language/completionItemProvider/routerCompletionItemProvider';
import UmiRouterDefinitionProvider from './language/router';
import {
  ModelInfoCache,
  ModelCacheKeyParser,
  ModelCache,
} from './common/cache';
import { DvaModelParser } from './common/parser';
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
  const modelCache = new ModelCache(
    new ModelCacheKeyParser(new DvaModelParser())
  );
  umiFileWatcher.onDidChange(e => modelCache.update(e.fsPath));
  umiFileWatcher.onDidCreate(e => modelCache.update(e.fsPath));
  umiFileWatcher.onDidDelete(e => modelCache.update(e.fsPath));

  const modelInfoCache = new ModelInfoCache(modelCache);

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

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      new UmiRouterCompletionItemProvider(),
      ...['/']
    )
  );
}

export function deactivate() {}
