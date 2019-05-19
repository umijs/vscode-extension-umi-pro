import { ModelInfoCache } from './../common/cache/index';
import { Service, Inject, Container } from 'typedi';
import { ReferenceProvider, TextDocument, Position } from 'vscode';
import ModelReferenceService from '../services/modelReferenceService';
import { VscodeService } from '../services/vscodeService';

@Service()
export default class UmiModelReferenceProvider implements ReferenceProvider {
  @Inject(_type => ModelReferenceService)
  private modelReferenceService!: ModelReferenceService;

  @Inject(_type => VscodeService)
  private vscodeService!: VscodeService;

  private modelInfoCache: ModelInfoCache;

  constructor() {
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
