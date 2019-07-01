import * as vscode from 'vscode';
import { VscodeServiceToken, IVscodeService } from './../vscodeService';
import * as fs from 'mz/fs';
import { dirname, join } from 'path';
import * as babelParser from '@babel/parser';
import {
  ExportDefaultDeclaration,
  isExportDefaultDeclaration,
  isObjectExpression,
  isSpreadElement,
  isTSAsExpression,
  isObjectProperty,
  isStringLiteral,
  SpreadElement,
  isIdentifier,
  Statement,
  isImportDeclaration,
  isImportDefaultSpecifier,
} from '@babel/types';
import { Service, Token, Inject } from 'typedi';
import { ILocale } from '../../common/types';
import { flatten } from '../../common/utils';

export interface ILocaleParser {
  parseFile(path: string): Promise<ILocale[]>;
}

export const LocaleParserToken = new Token<ILocaleParser>();

@Service(LocaleParserToken)
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _LocaleParser implements ILocaleParser {
  public readonly vscodeService: IVscodeService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.vscodeService = vscodeService;
  }

  public async parseFile(path: string): Promise<ILocale[]> {
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
    const localeAst = isTSAsExpression(defaultDeclaration)
      ? defaultDeclaration.expression
      : defaultDeclaration;

    if (!isObjectExpression(localeAst)) {
      return [];
    }

    const result = await Promise.all(
      localeAst.properties
        .map(p => {
          let propLoc = p.loc;
          let propKey: string = '';

          if (isObjectProperty(p)) {
            propKey = p.key.name;
            if (isStringLiteral(p.key)) {
              propKey = p.key.value;
              propLoc = p.key.loc;
            }
          }
          if (isSpreadElement(p)) {
            return this.getSpreadProperties(path, p, ast.program.body);
          }
          if (!propLoc || !propKey) {
            return null;
          }
          return Promise.resolve({
            fileUri: vscode.Uri.file(path),
            key: propKey,
            range: new vscode.Range(
              propLoc.start.line - 1,
              propLoc.start.column,
              propLoc.end.line - 1,
              propLoc.end.column
            ),
          });
        })
        .filter((p): p is Promise<any> => !!p)
    );

    return flatten(result);
  }

  private async getSpreadProperties(path: string, prop: SpreadElement, astbody: Statement[]) {
    const { argument } = prop;
    if (!isIdentifier(argument)) {
      return [];
    }
    const { name } = argument;
    const result = await this.parseByIdentifier(path, name, astbody);
    return result;
  }

  private async parseByIdentifier(path: string, identifier: string, astbody: Statement[]) {
    const found = astbody.find(a => {
      return (
        isImportDeclaration(a) &&
        a.specifiers.some(s => isImportDefaultSpecifier(s) && s.local.name === identifier)
      );
    });

    if (!found || !isImportDeclaration(found) || !isStringLiteral(found.source)) {
      return [];
    }
    const filePathPrefix = join(dirname(path), found.source.value);
    const targetFiles = [filePathPrefix, `${filePathPrefix}.js`, `${filePathPrefix}.ts`];
    const targetFile = targetFiles.find(t => fs.existsSync(t));
    if (!targetFile) {
      return [];
    }
    const result = await this.parseFile(targetFile);
    return result;
  }
}
