// Git repository listener that records commit activity from the built-in Git extension API.
import * as vscode from 'vscode';
import { request } from '../utils/apiClient';

export function registerGitListener(context: vscode.ExtensionContext): void {
  void watchGit();
}

async function watchGit(): Promise<void> {
  try {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    await gitExtension?.activate();
    const gitApi = gitExtension?.exports?.getAPI?.(1);
    const repository = gitApi?.repositories?.[0];
    if (!repository) {
      return;
    }

    let lastCommit = repository.state.HEAD?.commit || '';
    const interval = setInterval(async () => {
      try {
        const currentCommit = repository.state.HEAD?.commit || '';
        if (currentCommit && currentCommit !== lastCommit) {
          lastCommit = currentCommit;
          await request('/api/activity', {
            method: 'POST',
            body: JSON.stringify({
              type: 'git_commit',
              project: vscode.workspace.workspaceFolders?.[0]?.name || 'unknown',
              content: repository.state.HEAD?.message || currentCommit,
              metadata: {}
            })
          });
        }
      } catch (error) {
        return;
      }
    }, 30000);

    interval.unref?.();
  } catch (error) {
    return;
  }
}
