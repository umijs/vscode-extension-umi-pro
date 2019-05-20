// import { ModelReferenceParser } from './common/ast/modelReference';
import * as vscode from 'vscode';
import 'reflect-metadata';
import { Container } from 'typedi';
import {
  ActionTypeDefinitionProvider,
  ActionTypeHoverProvider,
  ModelActionReference,
  ActionTypeCompletionItemProvider,
} from './language/model';
import {
  UmiRouterCompletionItemProvider,
  UmiRouterDefinitionProvider,
} from './language/router';
import logger from './common/logger';
import { getUmiFileWatcher } from './common/fileWatcher';
import {
  loadVscodeService,
  VscodeServiceToken,
} from './services/vscodeService';
import { ModelInfoServiceToken } from './services/modelInfoService';
export async function activate(context: vscode.ExtensionContext) {
  logger.info('extension "umi-pro" is now active!');
  const umiFileWatcher = await getUmiFileWatcher(
    vscode.workspace.workspaceFolders
  );
  if (!umiFileWatcher) {
    logger.info('no project use umi');
    return;
  }
  const modelInfoService = Container.get(ModelInfoServiceToken);
  umiFileWatcher.onDidChange(e => modelInfoService.updateFile(e.fsPath));
  umiFileWatcher.onDidCreate(e => modelInfoService.updateFile(e.fsPath));
  umiFileWatcher.onDidDelete(e => modelInfoService.updateFile(e.fsPath));
  let vscodeService = Container.get(VscodeServiceToken);
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
      Container.get(ActionTypeCompletionItemProvider),
      ':'
    )
  );
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ['javascript', 'typescript'],
      Container.get(ActionTypeHoverProvider)
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      ['javascript', 'typescript'],
      Container.get(ActionTypeDefinitionProvider)
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      ['javascript', 'typescript'],
      Container.get(UmiRouterDefinitionProvider)
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      Container.get(UmiRouterCompletionItemProvider),
      ...['/']
    )
  );

  context.subscriptions.push(
    vscode.languages.registerReferenceProvider(
      ['javascript', 'typescript'],
      Container.get(ModelActionReference)
    )
  );
}

export function deactivate() {}
