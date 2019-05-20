import {
  IModelReferenceService,
  ModelReferenceServiceToken,
} from '../../services/modelReferenceService';
import {
  VscodeServiceToken,
  IVscodeService,
} from '../../services/vscodeService';
import { Service, Inject } from 'typedi';
import { ReferenceProvider, TextDocument, Position } from 'vscode';
import {
  ModelInfoServiceToken,
  IModelInfoService,
} from '../../services/modelInfoService';

@Service()
export class ModelActionReference implements ReferenceProvider {
  private modelReferenceService: IModelReferenceService;

  private vscodeService: IVscodeService;

  private modelInfoService: IModelInfoService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService,
    @Inject(ModelInfoServiceToken)
    modelInfoService: IModelInfoService,
    @Inject(ModelReferenceServiceToken)
    modelReferenceService: IModelReferenceService
  ) {
    this.vscodeService = vscodeService;
    this.modelInfoService = modelInfoService;
    this.modelReferenceService = modelReferenceService;
  }

  async provideReferences(document: TextDocument, position: Position) {
    const projectPath = this.vscodeService.getProjectPath(document.uri.fsPath);
    if (!projectPath) {
      return;
    }
    const currentNamespace = await this.modelInfoService.getNameSpace(
      document.uri.fsPath
    );
    if (!currentNamespace) {
      return;
    }

    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return;
    }

    return this.modelReferenceService.getReference(
      document.uri.fsPath,
      currentNamespace,
      document.getText(range)
    );
  }
}
