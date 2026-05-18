// File event listeners that capture open and save activity without reading file contents.
import * as path from 'path';
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';
import { SidebarProvider } from '../providers/SidebarProvider';

const LAST_OPENED_AT = new Map<string, number>();
const IGNORED_SEGMENTS = ['node_modules', '.git'];
const BINARY_LANGUAGE_IDS = new Set(['binary']);

export function registerFileListener(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (document) => {
      await handleOpenDocument(document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      await handleSaveDocument(document);
    })
  );
}

async function handleOpenDocument(document: vscode.TextDocument): Promise<void> {
  try {
    if (!shouldTrack(document)) {
      return;
    }

    const filePath = document.fileName;
    const project = getProjectName(document.uri);
    await request('/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        type: 'file_open',
        filePath,
        project,
        content: `${path.basename(filePath)} opened`,
        metadata: {
          languageId: document.languageId,
          lineCount: document.lineCount
        }
      })
    });

    const previousOpenedAt = LAST_OPENED_AT.get(filePath) || 0;
    LAST_OPENED_AT.set(filePath, Date.now());

    if (Date.now() - previousOpenedAt > 4 * 60 * 60 * 1000) {
      const contextResult = await request(`/api/context/${encodeURIComponent(filePath)}`);
      await SidebarProvider.broadcast('devproductivity.context', {
        command: 'contextUpdated',
        data: { filePath, ...contextResult }
      });
    }
  } catch (error) {
    return;
  }
}

async function handleSaveDocument(document: vscode.TextDocument): Promise<void> {
  try {
    if (!shouldTrack(document)) {
      return;
    }

    await request('/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        type: 'file_save',
        filePath: document.fileName,
        project: getProjectName(document.uri),
        content: `${path.basename(document.fileName)} saved`,
        metadata: {
          lineCount: document.lineCount
        }
      })
    });
  } catch (error) {
    return;
  }
}

function shouldTrack(document: vscode.TextDocument): boolean {
  if (!document || document.uri.scheme !== 'file') {
    return false;
  }

  if (document.isUntitled || BINARY_LANGUAGE_IDS.has(document.languageId)) {
    return false;
  }

  return !IGNORED_SEGMENTS.some((segment) => document.fileName.includes(segment));
}

function getProjectName(uri: vscode.Uri): string {
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  return folder?.name || 'unknown';
}
