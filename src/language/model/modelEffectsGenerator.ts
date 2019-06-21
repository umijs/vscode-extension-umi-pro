import { Service, Inject } from 'typedi';
import {
  ModelEffectsParserToken,
  IModelEffectsParser,
} from './../../services/parser/modelEffectsParser';
import { Disposable, workspace, TextDocument, window } from 'vscode';

@Service()
export class ModelEffectsGenerator implements Disposable {
  private disposables: Array<Disposable> = [];
  private modelEffectsParser: IModelEffectsParser;

  constructor(
    @Inject(ModelEffectsParserToken)
    modelEffectsParser: IModelEffectsParser
  ) {
    this.modelEffectsParser = modelEffectsParser;
    this.disposables.push(workspace.onDidSaveTextDocument(this.handleDocumentSave));
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }

  handleDocumentSave = async (document: TextDocument) => {
    const { activeTextEditor } = window;
    if (!activeTextEditor || activeTextEditor.document !== document) {
      return;
    }
    try {
      const codeToChange = await this.modelEffectsParser.parseFile(document.uri.fsPath);
      if (codeToChange.length > 0) {
        activeTextEditor.edit(editBuilder => {
          codeToChange.forEach(({ range, code }) => {
            editBuilder.replace(range, code);
          });
          setTimeout(() => {
            document.save();
          }, 500);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
}
