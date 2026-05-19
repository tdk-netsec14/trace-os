// Command helper for ending the active focus session.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';
import { SidebarProvider } from '../providers/SidebarProvider';

export function registerEndFocusCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('devproductivity.endFocus', async () => {
      try {
        const result = await request('/api/focus/end', { method: 'POST' });
        await SidebarProvider.broadcast('devproductivity.focus', {
          command: 'focusEndResult',
          data: result
        });
        if (!result.error) {
          vscode.window.showInformationMessage('Focus session ended.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to end focus session.');
      }
    })
  );
}
