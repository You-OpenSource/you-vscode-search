
import { getRedHatService, TelemetryService } from '@dmi3coder/vscode-redhat-telemetry';
import * as vscode from 'vscode';
let telemetryService: TelemetryService | null = null;


export async function activateTelemetry(context: vscode.ExtensionContext) {
    const redhatService = await getRedHatService(context);
    telemetryService = await redhatService.getTelemetryService();
    telemetryService.sendStartupEvent();
}

export function getTelemetry(): TelemetryService {
    return telemetryService!;
}
