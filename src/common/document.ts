import * as vscode from 'vscode';
import { QuoteType, QuoteCharMap } from './config';

export class TextDocumentUtils {
  private document: vscode.TextDocument;
  private readonly illegal: vscode.Position;

  constructor(document: vscode.TextDocument) {
    this.document = document;
    this.illegal = document.validatePosition(
      new vscode.Position(Infinity, Infinity)
    );
  }

  public CharAt = (offset: number): string | null => {
    if (this.outOfRange(offset)) {
      return null;
    }
    return this.document.getText(
      new vscode.Range(
        this.document.positionAt(offset),
        this.document.positionAt(offset + 1)
      )
    );
  };

  public outOfRange = (offset: number) => {
    return this.document.positionAt(offset).isEqual(this.illegal);
  };

  public getWordInQuote = (position: vscode.Position, quoteType: QuoteType) => {
    const offset = this.document.offsetAt(position);
    if (this.outOfRange(offset)) {
      return null;
    }
    const startOfLint = this.document.offsetAt(
      new vscode.Position(position.line, 0)
    );
    const endOfLint = this.document.offsetAt(
      new vscode.Position(position.line, Infinity)
    );
    const charArray: string[] = [];
    const quoteChar = QuoteCharMap[quoteType];
    for (let i = offset; i > -startOfLint; i--) {
      const char = this.CharAt(i);
      if (char === quoteChar || char === null) {
        break;
      }
      charArray.unshift(char);
    }
    for (let i = offset + 1; i <= endOfLint; i++) {
      const char = this.CharAt(i);
      if (char === quoteChar || char === null) {
        break;
      }
      charArray.push(char);
    }
    return charArray.join('');
  };
}
