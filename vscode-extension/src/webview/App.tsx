// Bundled React app that renders the VS Code sidebar webviews.
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ContextView } from './views/ContextView';
import { StandupView } from './views/StandupView';
import { SearchView } from './views/SearchView';
import { FocusView } from './views/FocusView';
import { DecisionsView } from './views/DecisionsView';

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
};

const vscode = acquireVsCodeApi();
const VIEW_TYPE = (document.body.dataset.view || 'context').replace('devproductivity.', '');

type AppMessage = {
  command: string;
  data?: any;
};

function App() {
  const [lastMessage, setLastMessage] = useState<AppMessage | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<AppMessage>) => {
      setLastMessage(event.data);
    };

    window.addEventListener('message', handleMessage);
    vscode.postMessage({ command: 'ready', data: { viewType: VIEW_TYPE } });
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const view = useMemo(() => {
    switch (VIEW_TYPE) {
      case 'standup':
        return <StandupView lastMessage={lastMessage} vscode={vscode} />;
      case 'search':
        return <SearchView lastMessage={lastMessage} vscode={vscode} />;
      case 'focus':
        return <FocusView lastMessage={lastMessage} vscode={vscode} />;
      case 'decisions':
        return <DecisionsView lastMessage={lastMessage} vscode={vscode} />;
      case 'context':
      default:
        return <ContextView lastMessage={lastMessage} vscode={vscode} />;
    }
  }, [lastMessage]);

  return (
    <>
      <style>{baseStyles}</style>
      {view}
    </>
  );
}

const baseStyles = `
  :root {
    color-scheme: light dark;
    font-family: Inter, system-ui, sans-serif;
  }
  body {
    margin: 0;
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
  }
  .shell {
    padding: 16px;
  }
  .card {
    border: 1px solid var(--vscode-panel-border);
    background: var(--vscode-editor-background);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
  }
  .button {
    border: 0;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }
  .button.secondary {
    background: transparent;
    color: var(--vscode-editor-foreground);
    border: 1px solid var(--vscode-panel-border);
  }
  .input, .textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    padding: 8px 10px;
    margin-bottom: 8px;
  }
  .muted {
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px;
  }
  .label {
    display: block;
    margin: 8px 0 4px;
    font-weight: 600;
  }
`;

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
