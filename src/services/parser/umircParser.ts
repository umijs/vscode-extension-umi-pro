import { VscodeServiceToken, IVscodeService } from './../vscodeService';
import { IUmirc } from '../../common/types';
import { isNotNull } from '../../common/utils';
import * as fs from 'mz/fs';
import * as babelParser from '@babel/parser';

import { Service, Token, Inject } from 'typedi';

import {
  isExportDefaultDeclaration,
  isObjectExpression,
  ExportDefaultDeclaration,
  isTSAsExpression,
  ObjectProperty,
  SpreadElement,
  ObjectMethod,
  isObjectMethod,
  isObjectProperty,
} from '@babel/types';

export interface IUmircParser {
  parseFile(path: string): Promise<IUmirc[]>;
}

export const UmircParserToken = new Token<IUmircParser>();

@Service(UmircParserToken)
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _UmircParser implements IUmircParser {
  public readonly vscodeService: IVscodeService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.vscodeService = vscodeService;
  }

  public async parseFile(path: string): Promise<IUmirc[]> {
    const code = await fs.readFile(path, 'utf-8');
    const config = this.vscodeService.getConfig(path);
    if (!config) {
      return [];
    }
    const ast = babelParser.parse(code, config.parserOptions);
    const exportDefaultDeclaration = ast.program.body.find((n): n is ExportDefaultDeclaration =>
      isExportDefaultDeclaration(n)
    );
    if (!exportDefaultDeclaration) {
      return [];
    }
    const defaultDeclaration = exportDefaultDeclaration.declaration;
    const umircAst = isTSAsExpression(defaultDeclaration)
      ? defaultDeclaration.expression
      : defaultDeclaration;

    if (!isObjectExpression(umircAst)) {
      return [];
    }

    return umircAst.properties.map(p => this.parseProperty(p)).filter((p): p is IUmirc => !!p);
  }

  private parseProperty(prop: ObjectMethod | ObjectProperty | SpreadElement): IUmirc | null {
    if (isObjectMethod(prop)) {
      const { key, start, end, loc } = prop;
      if (isNotNull(key) && isNotNull(start) && isNotNull(end) && isNotNull(loc)) {
        return {
          key: key.name,
          start: start,
          end: end,
          loc: loc,
        };
      }
      return null;
    }
    if (isObjectProperty(prop)) {
      const { key, start, end, loc } = prop;
      if (isNotNull(key) && isNotNull(start) && isNotNull(end) && isNotNull(loc)) {
        return {
          key: key.name,
          start: start,
          end: end,
          loc: loc,
        };
      }
      return null;
    }
    return null;
  }
}
