import * as vscode from "vscode";

const uri = vscode.Uri.parse('you-com-search:' + 'suggestions');
export default class OpenCommand {


    static activate(context: vscode.ExtensionContext) {
        const command = 'you-com-search.open';
        let applyCommand = new OpenCommand();
        context.subscriptions.push(vscode.commands.registerCommand(command, applyCommand.handle));
    }


    handle = async (position: number = 0) => {
        const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
        await vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.Beside,
            preserveFocus: true
        });
        vscode.window.showInformationMessage('You.com code assistant activated!');
    };

}