import { workspace, languages, ExtensionContext } from 'vscode';
import 'reflect-metadata';
import { Container } from 'typedi';
import {
  ActionTypeDefinitionProvider,
  ActionTypeHoverProvider,
  ModelActionReference,
  ActionTypeCompletionItemProvider,
  ModelEffectsGenerator,
} from './language/model';
import { LocaleKeyCompletionItemProvider, LocaleDefinitionProvider } from './language/locale';
import { UmircDecoration } from './language/umircDecoration';
import { UmiRouterCompletionItemProvider, UmiRouterDefinitionProvider } from './language/router';
import logger from './common/logger';
import { getUmiFileWatcher } from './common/fileWatcher';
import { loadVscodeService, VscodeServiceToken } from './services/vscodeService';
import { ModelInfoServiceToken } from './services/modelInfoService';
import { LocaleServiceToken } from './services/localeService';
import { SUPPORT_LANGUAGE } from './common/types';

export async function activate(context: ExtensionContext) {
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

  const localeService = Container.get(LocaleServiceToken);
  umiFileWatcher.onDidCreate(e => localeService.updateFile(e.fsPath));
  umiFileWatcher.onDidChange(e => localeService.updateFile(e.fsPath));
  umiFileWatcher.onDidDelete(e => localeService.deleteFile(e.fsPath));

  let vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);
  await localeService.initLocales();
  workspace.onDidChangeWorkspaceFolders(() => loadVscodeService(vscodeService));
  workspace.onDidChangeConfiguration(() => loadVscodeService(vscodeService));
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
    languages.registerCompletionItemProvider(
      SUPPORT_LANGUAGE,
      Container.get(LocaleKeyCompletionItemProvider),
      '=',
      ' ',
      ':'
    )
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(SUPPORT_LANGUAGE, Container.get(LocaleDefinitionProvider))
  );

  context.subscriptions.push(
    languages.registerReferenceProvider(SUPPORT_LANGUAGE, Container.get(ModelActionReference))
  );

  context.subscriptions.push(Container.get(UmircDecoration));

  context.subscriptions.push(Container.get(ModelEffectsGenerator));
}

export function deactivate() {}
