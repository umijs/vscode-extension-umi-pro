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

import umircDef from './umircDef';

@Service()
export class UmircDecoration implements Disposable {
  private umircParser: IUmircParser;
  private activeEditor: TextEditor | undefined;

  private annotationDecoration = window.createTextEditorDecorationType({});

  private disposables: Array<Disposable> = [];

  constructor(
    @Inject(UmircParserToken)
    umircParser: IUmircParser
  ) {
    this.umircParser = umircParser;

    this.init();
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }

  async triggerUpdateDecorations() {
    if (!this.validUmirc(this.activeEditor)) {
      return;
    }

    try {
      const umiProperties = await this.umircParser.parseFile(this.activeEditor.document.fileName);

      const decorations: Array<DecorationOptions> = umiProperties
        .map(p => {
          if (!this.activeEditor || !umircDef[p.key]) {
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
                contentText: ` \u22C5 ${umircDef[p.key]}`,
              },
            },
            range: this.activeEditor.document.validateRange(
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

      this.activeEditor.setDecorations(this.annotationDecoration, decorations);
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

  private init() {
    this.activeEditor = window.activeTextEditor;
    if (this.validUmirc(this.activeEditor)) {
      this.triggerUpdateDecorations();
    }

    this.disposables.push(
      window.onDidChangeActiveTextEditor(editor => {
        this.activeEditor = editor;
        if (this.validUmirc(this.activeEditor)) {
          this.triggerUpdateDecorations();
        }
      })
    );

    this.disposables.push(
      workspace.onDidChangeTextDocument(event => {
        if (this.validUmirc(this.activeEditor) && event.document === this.activeEditor.document) {
          this.triggerUpdateDecorations();
        }
      })
    );
  }
}
