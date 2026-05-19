// Command helper for starting a focus session.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';
import { SidebarProvider } from '../providers/SidebarProvider';

export function registerStartFocusCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('devproductivity.startFocus', async () => {
      try {
        const taskName = await vscode.window.showInputBox({ prompt: 'Focus task name' });
        if (!taskName) {
          return;
        }

        const result = await request('/api/focus/start', {
          method: 'POST',
          body: JSON.stringify({ taskName })
        });
        await SidebarProvider.broadcast('devproductivity.focus', {
          command: 'focusStartResult',
          data: result
        });
        if (!result.error) {
          vscode.window.showInformationMessage('Focus session started.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to start focus session.');
      }
    })
  );
}
