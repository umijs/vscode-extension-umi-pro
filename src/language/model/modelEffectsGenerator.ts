import { Service, Inject } from 'typedi';
import {
  ModelEffectsParserToken,
  IModelEffectsParser,
} from './../../services/parser/modelEffectsParser';
import { Disposable, workspace, TextDocument, window } from 'vscode';
import { VscodeServiceToken, IVscodeService } from '../../services/vscodeService';

@Service()
export class ModelEffectsGenerator implements Disposable {
  private disposables: Array<Disposable> = [];
  private modelEffectsParser: IModelEffectsParser;
  private vscodeService: IVscodeService;

  constructor(
    @Inject(ModelEffectsParserToken)
    modelEffectsParser: IModelEffectsParser,
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.modelEffectsParser = modelEffectsParser;
    this.vscodeService = vscodeService;
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
    const config = this.vscodeService.getConfig(document.uri.fsPath);
    if (!config || !config.autoGenerateSagaEffectsCommands) {
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
          }, config.saveOnGenerateEffectsCommandTimeout);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
}
