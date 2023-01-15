import * as vscode from "vscode";
import { Result } from "../data/repository/ApiService";
import { getTelemetry } from "../telemetry";


export default class ApplyCommand {
    private getActiveEditor: () => (vscode.TextEditor | undefined);
    private getSolutions: () => Result[];


    static activate(context: vscode.ExtensionContext, getActiveEditor: () => vscode.TextEditor | undefined,
        getSolutions: () => Result[]) {

        const command = 'you-com-search.apply';
        let applyCommand = new ApplyCommand(getActiveEditor, getSolutions);
        context.subscriptions.push(vscode.commands.registerCommand(command, applyCommand.handle));
    }


    constructor(
        getActiveEditor: () => vscode.TextEditor | undefined,
        getSolutions: () => Result[]
    ) {
        this.getActiveEditor = getActiveEditor;
        this.getSolutions = getSolutions;
    }

    handle = (position: number = 0) => {
        let activeEditor = this.getActiveEditor();
        const selectedSolution = this.getSolutions()[position].snippet_code
        if (activeEditor) {
            getTelemetry().send({
                name: "vscode_user_click",
                type: "track",
                properties: {
                    "solution.number": position,
                    "solution.codeSnippet": selectedSolution
                }
            });

            activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                const selection = activeEditor!.selection;
                editBuilder.replace(selection, selectedSolution);
            });
        }
    };

}