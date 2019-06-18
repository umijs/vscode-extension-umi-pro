import { Service, Inject } from 'typedi';
import {
  Disposable,
  window,
  workspace,
  TextEditor,
  ThemeColor,
  Range,
  DecorationOptions,
} from 'vscode';
import { basename } from 'path';
import { isNotNull } from '../../common/utils';
import { IUmircParser, UmircParserToken } from '../../services/parser/umircParser';
import { getlang } from './umircDef';

@Service()
export class UmircDecoration implements Disposable {
  private umircParser: IUmircParser;
  private lang: object = getlang();

  private annotationDecoration = window.createTextEditorDecorationType({});

  private disposables: Array<Disposable> = [];

  constructor(
    @Inject(UmircParserToken)
    umircParser: IUmircParser
  ) {
    this.umircParser = umircParser;
    this.triggerUpdateDecorations();
    this.disposables.push(
      window.onDidChangeActiveTextEditor(this.triggerUpdateDecorations.bind(this))
    );
    this.disposables.push(workspace.onDidChangeTextDocument(() => this.triggerUpdateDecorations()));
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }

  async triggerUpdateDecorations() {
    let editor = window.activeTextEditor;
    if (!this.validUmirc(editor)) {
      return;
    }
    const { document } = editor;

    try {
      const umiProperties = await this.umircParser.parseFile(document.fileName);
      const decorations: Array<DecorationOptions> = umiProperties
        .map(p => {
          if (!this.lang[p.key]) {
            return null;
          }
          const decoration: DecorationOptions = {
            renderOptions: {
              after: {
                color: new ThemeColor('umipro.annotationColor'),
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecoration: 'none',
                margin: '0',
                contentText: ` \u22C5 ${this.lang[p.key]}`,
              },
            },
            range: document.validateRange(
              new Range(
                p.loc.start.line - 1,
                Number.MAX_SAFE_INTEGER,
                p.loc.start.line - 1,
                Number.MAX_SAFE_INTEGER
              )
            ),
          };
          return decoration;
        })
        .filter(isNotNull);

      editor.setDecorations(this.annotationDecoration, decorations);
    } catch (error) {
      console.warn('error', error);
    }
  }

  private validUmirc(editor: TextEditor | undefined): editor is TextEditor {
    if (!editor) {
      return false;
    }
    const { fileName } = editor.document;
    if (basename(fileName).includes('.umirc')) {
      return true;
    }
    return fileName.endsWith('config/config.js') || fileName.endsWith('config/config.ts');
  }
}
