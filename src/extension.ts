// import { ModelReferenceParser } from './common/ast/modelReference';
import * as vscode from 'vscode';
import 'reflect-metadata';
import DvaCompletionItemProvider from './language/completionItemProvider/completionItem';
import DvaDefinitionProvider from './language/definitionProvider';
import DvaHoverProvider from './language/hoverProvider';
import ModelReference from './language/modelReference';
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
import { Container } from 'typedi';
import { VscodeService, loadVscodeService } from './services/vscodeService';

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
  Container.set('modelInfoCache', modelInfoCache);
  let vscodeService = Container.get(VscodeService);
  await loadVscodeService(vscodeService);
  vscode.workspace.onDidChangeWorkspaceFolders(() =>
    loadVscodeService(vscodeService)
  );
  vscode.workspace.onDidChangeConfiguration(() =>
    loadVscodeService(vscodeService)
  );

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

  const modelReference = Container.get(ModelReference);
  context.subscriptions.push(
    vscode.languages.registerReferenceProvider(
      ['javascript', 'typescript'],
      modelReference
    )
  );
}

export function deactivate() {}
