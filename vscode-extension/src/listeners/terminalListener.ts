// Terminal shell execution listener that records sanitized commands only.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';

const SECRET_PATTERN = /(password|token|secret|key|auth|bearer)[\s=:][^\s]+/gi;
const SECRET_WORDS = ['password', 'token', 'secret', 'key', 'auth', 'bearer'];

export function registerTerminalListener(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidEndTerminalShellExecution(async (event) => {
      await handleShellExecution(event);
    })
  );
}

async function handleShellExecution(event: vscode.TerminalShellExecutionEndEvent): Promise<void> {
  try {
    const command = String(event.execution?.commandLine?.value || '').trim();
    if (!command) {
      return;
    }

    const lowered = command.toLowerCase();
    if (SECRET_WORDS.some((word) => lowered.includes(word))) {
      return;
    }

    const sanitizedCommand = command.replace(SECRET_PATTERN, '[REDACTED]').replace(/(-p\s+\S+)/gi, '[REDACTED]');
    await request('/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        type: 'terminal_command',
        project: vscode.workspace.workspaceFolders?.[0]?.name || 'unknown',
        content: sanitizedCommand,
        metadata: {
          exitCode: event.exitCode
        }
      })
    });
  } catch (error) {
    return;
  }
}
