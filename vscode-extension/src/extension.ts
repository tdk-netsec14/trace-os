// VS Code extension entry point for Trace OS.
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { request } from './utils/apiClient';
import { SidebarProvider, isKnownViewId } from './providers/SidebarProvider';
import { registerFileListener } from './listeners/fileListener';
import { registerTerminalListener } from './listeners/terminalListener';
import { registerGitListener } from './listeners/gitListener';
import { registerResumeContextCommand } from './commands/resumeContext';
import { registerGenerateStandupCommand } from './commands/generateStandup';
import { registerStartFocusCommand } from './commands/startFocus';
import { registerEndFocusCommand } from './commands/endFocus';
import { registerLogDecisionCommand } from './commands/logDecision';

const VIEW_IDS = [
  'devproductivity.context',
  'devproductivity.standup',
  'devproductivity.search',
  'devproductivity.focus',
  'devproductivity.decisions'
];

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  loadExtensionEnv(context.extensionPath);

  for (const viewId of VIEW_IDS) {
    if (isKnownViewId(viewId)) {
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(viewId, new SidebarProvider(viewId, context.extensionUri))
      );
    }
  }

  registerResumeContextCommand(context);
  registerGenerateStandupCommand(context);
  registerStartFocusCommand(context);
  registerEndFocusCommand(context);
  registerLogDecisionCommand(context);

  registerFileListener(context);
  registerTerminalListener(context);
  registerGitListener(context);

  try {
    const health = await request('/api/health');
    if (health.error || health.status !== 'ok') {
      vscode.window.showWarningMessage('Trace OS: Local server not running. Start it with: cd server && node index.js');
    }
  } catch (error) {
    vscode.window.showWarningMessage('Trace OS: Local server not running. Start it with: cd server && node index.js');
  }
}

export function deactivate(): void {
  return;
}

function loadExtensionEnv(extensionPath: string): void {
  try {
    const envPath = path.join(extensionPath, '.env');
    if (!fs.existsSync(envPath)) {
      return;
    }

    const contents = fs.readFileSync(envPath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (key) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    return;
  }
}
