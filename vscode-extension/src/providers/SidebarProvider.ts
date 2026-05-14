// Webview provider for the Trace OS sidebar panels.
import * as path from 'path';
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';

const VIEW_IDS = new Set([
  'devproductivity.context',
  'devproductivity.standup',
  'devproductivity.search',
  'devproductivity.focus',
  'devproductivity.decisions'
]);

type WebviewMessage = {
  command: string;
  data?: any;
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  private static instances = new Map<string, SidebarProvider>();
  private view?: vscode.WebviewView;

  constructor(private readonly viewType: string, private readonly extensionUri: vscode.Uri) {
    SidebarProvider.instances.set(viewType, this);
  }

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    webviewView.webview.html = this.getHtmlContent(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await this.handleMessage(webviewView.webview, message);
    });
  }

  public static async broadcast(viewType: string, message: WebviewMessage): Promise<void> {
    const provider = SidebarProvider.instances.get(viewType);
    if (provider?.view) {
      await provider.view.webview.postMessage(message);
    }
  }

  private async handleMessage(webview: vscode.Webview, message: WebviewMessage): Promise<void> {
    try {
      switch (message.command) {
        case 'fetchContext': {
          const result = await request(`/api/context/${encodeURIComponent(String(message.data?.filePath || ''))}`);
          await webview.postMessage({ command: 'contextResult', data: result });
          break;
        }
        case 'fetchStandup': {
          const result = await request('/api/standup', {
            method: 'POST',
            body: JSON.stringify({ hoursBack: message.data?.hoursBack || 24 })
          });
          await webview.postMessage({ command: 'standupResult', data: result });
          break;
        }

        case 'startSearch': {
          const result = await request('/api/search', {
            method: 'POST',
            body: JSON.stringify({ query: message.data?.query || '', limit: message.data?.limit || 10 })
          });
          await webview.postMessage({ command: 'searchResult', data: result });
          break;
        }
        case 'startFocus': {
          const result = await request('/api/focus/start', {
            method: 'POST',
            body: JSON.stringify({ taskName: message.data?.taskName || '' })
          });
          await webview.postMessage({ command: 'focusStartResult', data: result });
          break;
        }
        case 'endFocus': {
          const result = await request('/api/focus/end', { method: 'POST' });
          await webview.postMessage({ command: 'focusEndResult', data: result });
          break;
        }
        case 'logDecision': {
          const result = await request('/api/decisions', {
            method: 'POST',
            body: JSON.stringify(message.data || {})
          });
          await webview.postMessage({ command: 'decisionLogged', data: result });
          break;
        }
        case 'copyToClipboard': {
          await vscode.env.clipboard.writeText(String(message.data?.text || ''));
          break;
        }
        case 'refreshFocus': {
          const [activeResult, sessionsResult] = await Promise.all([
            request('/api/focus/active'),
            request('/api/focus')
          ]);
          await webview.postMessage({ command: 'focusActiveResult', data: activeResult });
          await webview.postMessage({ command: 'focusSessionsResult', data: sessionsResult });
          break;
        }
        case 'refreshDecisions': {
          const result = await request('/api/decisions?limit=50');
          await webview.postMessage({ command: 'decisionsResult', data: result });
          break;
        }
        case 'deleteDecision': {
          const id = message.data?.id;
          const result = await request(`/api/decisions/${id}`, { method: 'DELETE' });
          await webview.postMessage({ command: 'decisionDeleted', data: result });
          break;
        }
        default:
          break;
      }
    } catch (error) {
      await webview.postMessage({ command: 'error', data: { error: 'Failed to process webview message' } });
    }
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'out', 'webview.js'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trace OS</title>
</head>
<body data-view="${this.viewType}" data-nonce="${nonce}">
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let index = 0; index < 32; index += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function isKnownViewId(viewId: string): boolean {
  return VIEW_IDS.has(viewId);
}
