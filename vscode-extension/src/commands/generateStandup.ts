// Command helper for generating a standup from local activity.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';
import { SidebarProvider } from '../providers/SidebarProvider';

export function registerGenerateStandupCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('devproductivity.generateStandup', async () => {
      try {
        const result = await request('/api/standup', {
          method: 'POST',
          body: JSON.stringify({ hoursBack: 24 })
        });
        await SidebarProvider.broadcast('devproductivity.standup', {
          command: 'standupResult',
          data: result
        });
        if (!result.error) {
          vscode.window.showInformationMessage('Standup generated.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to generate standup.');
      }
    })
  );
}
