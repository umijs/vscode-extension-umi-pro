import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItem,
  TextDocumentPositionParams,
  InitializeParams,
} from 'vscode-languageserver';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

connection.onInitialize((_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
});

connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
  connection.console.log('on Completion');
  return [];
});

documents.listen(connection);
connection.listen();
