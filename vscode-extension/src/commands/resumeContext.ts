// Command helper for resuming the current file context in VS Code.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';
import { SidebarProvider } from '../providers/SidebarProvider';

export function registerResumeContextCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('devproductivity.resumeContext', async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('Open a file to resume context.');
          return;
        }

        const filePath = editor.document.fileName;
        const result = await request(`/api/context/${encodeURIComponent(filePath)}`);
        await SidebarProvider.broadcast('devproductivity.context', {
          command: 'contextUpdated',
          data: { filePath, ...result }
        });
        if (!result.error) {
          vscode.window.showInformationMessage('Context brief refreshed.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to resume context.');
      }
    })
  );
}
