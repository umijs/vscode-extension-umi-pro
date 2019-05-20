import {
  VscodeServiceToken,
  IVscodeService,
} from './../services/vscodeService';
import { ModelInfoCache } from './../common/cache/index';
import { Service, Inject, Container } from 'typedi';
import { ReferenceProvider, TextDocument, Position } from 'vscode';
import ModelReferenceService from '../services/modelReferenceService';

@Service()
export default class UmiModelReferenceProvider implements ReferenceProvider {
  private modelReferenceService!: ModelReferenceService;

  private vscodeService: IVscodeService;

  private modelInfoCache: ModelInfoCache;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.vscodeService = vscodeService;
    console.log('init UmiModelReferenceProvider');
    this.modelInfoCache = Container.get('modelInfoCache');
  }

  async provideReferences(document: TextDocument, position: Position) {
    const projectPath = this.vscodeService.getProjectPath(document.uri.fsPath);
    if (!projectPath) {
      return;
    }
    const currentNamespace = await this.modelInfoCache.getCurrentNameSpace(
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
