import { workspace, languages } from 'vscode';
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

export async function activate(context) {
  logger.info('extension "umi-pro" is now active!');
  const umiFileWatcher = await getUmiFileWatcher(workspace.workspaceFolders);
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
  workspace.onDidChangeWorkspaceFolders(() => loadVscodeService(vscodeService));
  workspace.onDidChangeConfiguration(() => loadVscodeService(vscodeService));
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      Container.get(ActionTypeCompletionItemProvider),
      ':'
    )
  );
  context.subscriptions.push(
    languages.registerHoverProvider(
      ['javascript', 'typescript'],
      Container.get(ActionTypeHoverProvider)
    )
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(
      ['javascript', 'typescript'],
      Container.get(ActionTypeDefinitionProvider)
    )
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(
      ['javascript', 'typescript'],
      Container.get(UmiRouterDefinitionProvider)
    )
  );

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      Container.get(UmiRouterCompletionItemProvider),
      ...['/']
    )
  );

  context.subscriptions.push(
    languages.registerReferenceProvider(
      ['javascript', 'typescript'],
      Container.get(ModelActionReference)
    )
  );
}

export function deactivate() {}
