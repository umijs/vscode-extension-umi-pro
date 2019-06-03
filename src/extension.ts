import 'reflect-metadata';
import { workspace, languages } from 'vscode';
import { Container } from 'typedi';
import {
  ActionTypeDefinitionProvider,
  ActionTypeHoverProvider,
  ModelActionReference,
  ActionTypeCompletionItemProvider,
} from './language/model';
import { UmiRouterCompletionItemProvider, UmiRouterDefinitionProvider } from './language/router';
import logger from './common/logger';
import { getUmiFileWatcher } from './common/fileWatcher';
import { VscodeServiceToken } from './services/vscodeService';
import { ModelInfoServiceToken } from './services/modelInfoService';
import { SUPPORT_LANGUAGE } from './common/types';

export async function activate(context) {
  logger.info('extension "umi-pro" is now active!');
  const umiFileWatcher = await getUmiFileWatcher(workspace.workspaceFolders);
  if (!umiFileWatcher) {
    logger.info('no project use umi');
    return;
  }
  let vscodeService = Container.get(VscodeServiceToken);
  const modelInfoService = Container.get(ModelInfoServiceToken);
  umiFileWatcher.onDidChange(e => modelInfoService.updateFile(e.fsPath));
  umiFileWatcher.onDidCreate(e => modelInfoService.updateFile(e.fsPath));
  umiFileWatcher.onDidDelete(e => modelInfoService.updateFile(e.fsPath));
  await vscodeService.init();
  workspace.onDidChangeWorkspaceFolders(() => vscodeService.init());
  workspace.onDidChangeConfiguration(() => vscodeService.init());
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      SUPPORT_LANGUAGE,
      Container.get(ActionTypeCompletionItemProvider),
      ':'
    )
  );
  context.subscriptions.push(
    languages.registerHoverProvider(SUPPORT_LANGUAGE, Container.get(ActionTypeHoverProvider))
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(
      SUPPORT_LANGUAGE,
      Container.get(ActionTypeDefinitionProvider)
    )
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(
      SUPPORT_LANGUAGE,
      Container.get(UmiRouterDefinitionProvider)
    )
  );

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      SUPPORT_LANGUAGE,
      Container.get(UmiRouterCompletionItemProvider),
      ...['/']
    )
  );

  context.subscriptions.push(
    languages.registerReferenceProvider(SUPPORT_LANGUAGE, Container.get(ModelActionReference))
  );
}

export function deactivate() {}
