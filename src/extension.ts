// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { eventNames } from 'process';
import { Subject, interval, debounce } from 'rxjs';
import * as vscode from 'vscode';
import { TextEditorSelectionChangeEvent } from "vscode";
import { YouSuggestionPaneProvider } from './paneProvider';
import RemoteYouRepository from './data/repository/RemoteYouRepository';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	YouSuggestionPaneProvider.register(context);
	const selectionSubject = new Subject<String>();
	let test = '';
	selectionSubject.pipe(debounce(() => interval(1000))).subscribe((selection) => {
		RemoteYouRepository.getCodeSuggestions({ codeLine: selection }).subscribe((response) => {
			// test = response.searchResults.results[0].snippet_code;
			test = JSON.stringify(response);
			// test = response.searchResults.results.map((result) => {
			// 	return result.snippet_code;
			// }).reduce((acc, curr) => {
			// 	return acc + "\n" + curr;
			// }, '');
			myProvider.onDidChangeEmitter.fire(uri);
		}, (error) => {
			console.log("Request failed :(");
			test = 'Request to You.com failed :(';
			myProvider.onDidChangeEmitter.fire(uri);
			console.log(error);
		});
	});

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "you-com-search" is now active!');

	const myScheme = 'you-com-search';
	const myProvider = new class implements vscode.TextDocumentContentProvider {

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		provideTextDocumentContent(uri: vscode.Uri): string {
			return test;
		}
	};

	vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider);
	const uri = vscode.Uri.parse('you-com-search:' + 'test.youcomsuggestions');
	vscode.window.onDidChangeTextEditorSelection((evt: TextEditorSelectionChangeEvent) => {
		console.log(evt, 'event');
		if (evt.kind !== 2) {
			return;
		}
		const selection = evt.textEditor.selection;
		test = evt.textEditor.document.getText(selection);
		selectionSubject.next(test);
	});
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('you-com-search.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// const uri = vscode.Uri.parse('you-com-search:' + 'test');
		const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
		vscode.commands.executeCommand("vscode.openWith", uri, YouSuggestionPaneProvider.viewType, { preview: true, viewColumn: vscode.ViewColumn.Beside, preserveFocus: true });
		// await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside, preserveFocus: true });
		vscode.window.showInformationMessage('Hello World from you.com search!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
