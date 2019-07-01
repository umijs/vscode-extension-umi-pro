import { Inject, Service } from 'typedi';
import { ILocaleService, LocaleServiceToken } from './../../services/localeService';
import { IVscodeService, VscodeServiceToken } from './../../services/vscodeService';
import * as vscode from 'vscode';
import { quoteString } from '../../common/utils';
import { QuoteType } from '../../common/types';

@Service()
export class LocaleKeyCompletionItemProvider implements vscode.CompletionItemProvider {
  private vscodeService: IVscodeService;

  private localeService: ILocaleService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService,
    @Inject(LocaleServiceToken)
    localeService: ILocaleService
  ) {
    this.vscodeService = vscodeService;
    this.localeService = localeService;
  }
  async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const filePath = document.uri.fsPath;
    const userConfig = this.vscodeService.getConfig(filePath);
    if (!userConfig) {
      return;
    }

    // 从当前点向前找50个字符
    const text = document.getText(
      new vscode.Range(document.positionAt(document.offsetAt(position) - 50), position)
    );

    const linePrefix = document.lineAt(position).text.substr(0, position.character);
    if (!linePrefix.endsWith('id=') && !linePrefix.match(/id\s*:\s*$/)) {
      return [];
    }

    if (
      !text.includes('<FormattedMessage') &&
      !text.includes('formatMessage') &&
      !text.includes('<FormattedHTMLMessage') &&
      !text.includes('formatHTMLMessage')
    ) {
      return [];
    }

    const keys = this.localeService.getKeys(filePath);

    const config = this.vscodeService.getConfig(filePath);

    let quoteType = config ? config.quotes : QuoteType.single;

    // use double quote while in component usage
    // TODO: better solution?
    if (text.includes('<FormattedMessage') || text.includes('<FormattedHTMLMessage')) {
      quoteType = QuoteType.double;
    }

    return keys.map(k => {
      return new vscode.CompletionItem(quoteString(k, quoteType), vscode.CompletionItemKind.Value);
    });
  }
}
