// Command helper for logging an architectural decision.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';
import { SidebarProvider } from '../providers/SidebarProvider';

export function registerLogDecisionCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('devproductivity.logDecision', async () => {
      try {
        const title = await vscode.window.showInputBox({ prompt: 'Decision title' });
        if (!title) {
          return;
        }

        const description = await vscode.window.showInputBox({ prompt: 'Decision description' });
        if (!description) {
          return;
        }

        const rationale = await vscode.window.showInputBox({ prompt: 'Decision rationale', value: '' });
        const tagsInput = await vscode.window.showInputBox({ prompt: 'Tags, comma separated', value: '' });
        const result = await request('/api/decisions', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            rationale: rationale || '',
            filesAffected: [],
            tags: tagsInput || ''
          })
        });
        await SidebarProvider.broadcast('devproductivity.decisions', {
          command: 'decisionLogged',
          data: result
        });
        if (!result.error) {
          vscode.window.showInformationMessage('Decision logged.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to log decision.');
      }
    })
  );
}
